import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Helper to parse Prometheus-style text data
const parsePrometheusText = (text: string) => {
  const metrics: { [key: string]: { value: number, labels: any }[] } = {}
  const lines = text.split('\n')
  
  lines.forEach(line => {
    if (line.startsWith('#') || line.trim() === '') return
    
    const valuePart = line.lastIndexOf(' ')
    const keyPart = line.substring(0, valuePart)
    const value = parseFloat(line.substring(valuePart + 1))

    const labelStart = keyPart.indexOf('{')
    const key = labelStart === -1 ? keyPart : keyPart.substring(0, labelStart)
    
    let labels = {}
    if (labelStart !== -1) {
        const labelString = keyPart.substring(labelStart + 1, keyPart.length - 1)
        labels = Object.fromEntries(labelString.split(',').map(part => {
            const [key, value] = part.split('=')
            return [key, value.substring(1, value.length - 1)] // remove quotes
        }))
    }

    if (!metrics[key]) {
      metrics[key] = []
    }
    metrics[key].push({ value, labels })
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
    // --- Fetch 1: Management API ---
    const managementApiPromise = fetch(`https://api.supabase.com/v1/projects/${projectRef}/analytics/endpoints/usage.api-counts`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      next: { revalidate: 3600 },
    }).then(res => res.ok ? res.json() : Promise.reject(`Management API fetch failed: ${res.statusText}`))

    // --- Fetch 2: Privileged Metrics ---
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
    const storageQueryPromise = prisma.$queryRaw(
      Prisma.sql`SELECT metadata FROM storage.objects;`
    ).then(results => {
        if (!Array.isArray(results)) return 0;
        return results.reduce((acc, obj) => acc + (obj.metadata?.size || 0), 0)
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
    
    // --- Calculate Egress from metricsData ---
    const totalEgress = (metricsData['http_server_response_size_bytes_total'] || [])
      .reduce((acc, metric) => acc + metric.value, 0);

    const cachedEgress = (metricsData['supabase_storage_egress_cdn_bytes_total'] || [])
      .reduce((acc, metric) => acc + metric.value, 0);
      
    const dbSize = (metricsData['pg_database_size_bytes'] || [])
      .reduce((acc, metric) => acc + metric.value, 0);

    // --- Consolidate data ---
    const combinedUsage = {
        ...apiUsage,
        db_size: dbSize,
        storage_size: storageSizeData || 0,
        egress: totalEgress,
        cached_egress: cachedEgress,
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