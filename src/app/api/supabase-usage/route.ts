import { NextResponse } from 'next/server'

// Helper to parse Prometheus-style text data
const parsePrometheusText = (text: string) => {
  const metrics: { [key: string]: number } = {}
  const lines = text.split('\n')
  lines.forEach(line => {
    if (line.startsWith('#') || line.trim() === '') return
    
    const parts = line.split(' ')
    const key = parts[0].split('{')[0] // Strip labels
    const value = parseFloat(parts[1])

    if (key && !isNaN(value)) {
      // Sum values for the same key if it appears multiple times.
      // For pg_database_size_bytes, we sum up all dbs.
      // For other metrics, this is usually the desired behavior.
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

    console.log('metricsData', metricsData);

    if (managementData.result && managementData.result.length > 0) {
        apiUsage = managementData.result[0];
    }

    // --- Calculate Egress ---
    const totalEgress = 
      (metricsData['supabase_rest_egress_bytes_total'] || 0) +
      (metricsData['supabase_storage_egress_uncached_bytes_total'] || 0) +
      (metricsData['supabase_realtime_egress_bytes_total'] || 0) +
      (metricsData['supabase_auth_egress_bytes_total'] || 0) +
      (metricsData['supabase_functions_egress_bytes_total'] || 0);

    // --- Get DB size ---
    // Use pg_database_size_bytes which is the sum of all dbs including shadow dbs
    // The user has confirmed this value is correct.
    const dbSizeInBytes = metricsData['pg_database_size_bytes'] || 0;


    privilegedMetrics = {
        db_size: dbSizeInBytes,
        storage_size: metricsData['supabase_storage_size_bytes'] || 0, // Using the most likely name
        egress: totalEgress,
        cached_egress: metricsData['supabase_storage_egress_cdn_bytes_total'] || 0,
    }

    // --- Combine and return results ---
    return NextResponse.json({ ...apiUsage, ...privilegedMetrics })

  } catch (err: any) {
    if (err.message.includes('429')) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}