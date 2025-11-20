// app/api/vercel-usage/route.ts
import { NextResponse } from 'next/server';

type RateLimit = { limit: string | null; remaining: string | null; reset: string | null };

function extractRateLimit(h: Headers): RateLimit {
  return {
    limit: h.get('X-RateLimit-Limit'),
    remaining: h.get('X-RateLimit-Remaining'),
    reset: h.get('X-RateLimit-Reset'),
  };
}

async function fetchVercelUsage(url: string, token: string) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const text = await res.text().catch(() => '');
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { json = { _raw: text }; }
  const rateLimit = extractRateLimit(res.headers);

  return { res, json, rateLimit };
}

// --- Plan Limits ---
const PLAN_LIMITS: Record<string, { bandwidth: number }> = {
  free: { bandwidth: 100 * 1024 * 1024 * 1024 },  // 100 GB
  pro: { bandwidth: 1 * 1024 * 1024 * 1024 * 1024 }, // 1 TB
};

export async function GET(req: Request) {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) return NextResponse.json({ error: 'VERCEL_API_TOKEN not configured' }, { status: 500 });

  const urlObj = new URL(req.url);
  const plan = (urlObj.searchParams.get('plan') || 'free').toLowerCase();
  if (!PLAN_LIMITS[plan]) return NextResponse.json({ error: `Unknown plan '${plan}'` }, { status: 400 });

  const projectName = process.env.VERCEL_PROJECT_NAME;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = urlObj.searchParams.get('teamId') ?? undefined;

  const projectIdentifier = projectId || projectName;
  if (!projectIdentifier) {
    return NextResponse.json({ error: 'No project identifier configured (VERCEL_PROJECT_ID or VERCEL_PROJECT_NAME required)' }, { status: 400 });
  }

  const baseUrl = `https://api.vercel.com/v9/projects/${encodeURIComponent(projectIdentifier)}/usage`;
  const url = teamId ? `${baseUrl}?teamId=${encodeURIComponent(teamId)}` : baseUrl;

  try {
    const { res, json, rateLimit } = await fetchVercelUsage(url, token);

    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error?.message ?? 'Failed to fetch usage', details: json, rateLimit },
        { status: res.status }
      );
    }

    // Plan별 한도를 포함해서 반환
    return NextResponse.json({
      project: projectName,
      plan,
      limit: PLAN_LIMITS[plan],
      usage: json,
      rateLimit,
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error fetching Vercel usage', details: String(err) }, { status: 500 });
  }
}
