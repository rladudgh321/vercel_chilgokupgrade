import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Helper to parse Prometheus-style text data
const parsePrometheusText = (text: string) => {
  const metrics: { [key: string]: number } = {}
  const lines = text.split('\n')
  lines.forEach(line => {
    if (line.startsWith('#') || line.trim() === '') return
    const parts = line.split(' ')
    const key = parts[0].split('{')[0]
    const value = parseFloat(parts[1])
    if (key && !isNaN(value)) {
      metrics[key] = (metrics[key] || 0) + value
    }
  })
  return metrics
}

export async function GET() {
  const projectRef = process.env.SUPABASE_PROJECT_REF
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!projectRef || !accessToken || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase environment variables are not fully configured.' }, { status: 500 })
  }

  try {
    // --- Fetch 1: Management API (for egress, api counts) ---
    const managementApiPromise = fetch(`https://api.supabase.com/v1/projects/${projectRef}/analytics/endpoints/usage.api-counts`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      next: { revalidate: 3600 },
    }).then(res => res.ok ? res.json() : Promise.reject(`Management API fetch failed: ${res.statusText}`))

    // --- Fetch 2: Privileged Metrics (for DB size) ---
    const credentials = `service_role:${serviceRoleKey}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    const privilegedMetricsPromise = fetch(`https://${projectRef}.supabase.co/customer/v1/privileged/metrics`, {
        headers: { 'Authorization': `Basic ${encodedCredentials}` },
        next: { revalidate: 3600 },
    }).then(async res => {
        if (!res.ok) throw new Error(`Privileged Metrics fetch failed: ${res.statusText}`)
        return parsePrometheusText(await res.text())
    })
    
    // --- Fetch 3: Storage Size via SQL ---
    // The column name 'metadata' is a guess based on common Supabase patterns.
    // The user needs to confirm this by inspecting the schema.
    const storageQueryPromise = prisma.$queryRaw(
      Prisma.sql`SELECT metadata FROM storage.objects;`
    ).then(results => {
        if (!Array.isArray(results)) return 0;
        
        let totalSize = 0;
        for (const obj of results) {
            if (obj.metadata && typeof obj.metadata.size === 'number') {
                totalSize += obj.metadata.size;
            }
        }
        return totalSize;
    });

    // --- Execute fetches in parallel ---
    const [managementData, metricsData, storageSizeData] = await Promise.all([
        managementApiPromise,
        privilegedMetricsPromise,
        storageQueryPromise
    ]);

    let apiUsage = {};
    if (managementData.result && managementData.result.length > 0) {
        apiUsage = managementData.result[0];
    }

    // --- Consolidate data ---
    const combinedUsage = {
        ...apiUsage,
        db_size: metricsData['pg_database_size_bytes'] || 0,
        storage_size: storageSizeData || 0,
        // Egress data from management API is often more accurate for billing
        egress: apiUsage.egress || 0,
        cached_egress: apiUsage.cached_egress || 0,
    };

    return NextResponse.json(combinedUsage)

  } catch (err: any) {
    console.error("Error fetching Supabase usage:", err);
    
    if (err.message.includes('429')) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
    }
    return NextResponse.json({ error: err.message, code: err.code, meta: err.meta }, { status: 500 })
  }
}
