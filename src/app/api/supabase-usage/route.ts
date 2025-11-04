
import { NextResponse } from 'next/server'

// Helper to parse Prometheus-style text data
const parsePrometheusText = (text: string) => {
  const metrics: { [key: string]: number } = {}
  const lines = text.split('\n')
  lines.forEach(line => {
    if (line.startsWith('#') || line.trim() === '') return
    const parts = line.split(' ')
    const key = parts[0]
    const value = parseFloat(parts[1])
    if (key && !isNaN(value)) {
      metrics[key] = value
    }
  })
  return metrics
}

export async function GET() {
  const projectRef = process.env.SUPABASE_PROJECT_REF
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN // PAT token (sbp_...)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role JWT (ey...)

  if (!projectRef || !accessToken || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not fully configured on the server.' },
      { status: 500 }
    )
  }

  try {
    let apiUsage = {}
    let privilegedMetrics = {}

    // --- Fetch 1: Management API with PAT (for API counts, etc.) ---
    const managementApiPromise = fetch(`https://api.supabase.com/v1/projects/${projectRef}/analytics/endpoints/usage.api-counts`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      next: { revalidate: 3600 },
    }).then(async res => {
      if (!res.ok) throw new Error(`Management API fetch failed: ${res.statusText}`)
      return res.json()
    })

    // --- Fetch 2: Privileged Metrics with Service Role Key (for DB/Storage size) ---
    const credentials = `service_role:${serviceRoleKey}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    const privilegedMetricsPromise = fetch(`https://${projectRef}.supabase.co/customer/v1/privileged/metrics`, {
        headers: { 'Authorization': `Basic ${encodedCredentials}` },
        next: { revalidate: 3600 },
    }).then(async res => {
        if (!res.ok) throw new Error(`Privileged Metrics fetch failed: ${res.statusText}`)
        const textData = await res.text()
        return parsePrometheusText(textData)
    })

    // --- Execute fetches in parallel ---
    const [managementData, metricsData] = await Promise.all([
        managementApiPromise,
        privilegedMetricsPromise
    ]);

    if (managementData.result && managementData.result.length > 0) {
        apiUsage = managementData.result[0];
    }

    privilegedMetrics = {
        db_size: metricsData['pg_database_size_bytes'] || 0,
        storage_size: metricsData['supabase_storage_size_bytes'] || 0,
        // Note: Egress data is not available in this endpoint.
    }

    // --- Combine and return results ---
    return NextResponse.json({ ...apiUsage, ...privilegedMetrics })

  } catch (err: any) {
    // Handle potential 429 rate limiting from either API
    if (err.message.includes('429')) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
