// app/api/vercel-usage/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const projectName = process.env.VERCEL_PROJECT_NAME;
  const teamId = process.env.VERCEL_TEAM_ID;
  const projectIdOrName = projectId || projectName;

  console.log('Vercel Usage API Route Called');
  console.log('VERCEL_API_TOKEN found:', !!token);
  console.log('VERCEL_PROJECT_ID found:', !!projectId);
  console.log('VERCEL_PROJECT_NAME found:', !!projectName);
  console.log('VERCEL_TEAM_ID found:', !!teamId);

  if (!token || !projectIdOrName) {
    const missing = [];
    if (!token) missing.push('VERCEL_API_TOKEN');
    if (!projectIdOrName) missing.push('VERCEL_PROJECT_ID or VERCEL_PROJECT_NAME');
    const errorMessage = `The following environment variables are not configured: ${missing.join(', ')}.`;
    console.error(errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  try {
    // 프로젝트 이름을 쓸 경우 안전하게 인코딩
    const encoded = encodeURIComponent(projectIdOrName);
    const baseUrl = `https://api.vercel.com/v9/projects/${encoded}/usage`;
    const url = teamId ? `${baseUrl}?teamId=${encodeURIComponent(teamId)}` : baseUrl;
    console.log(`Fetching Vercel usage from: ${url}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      next: {
        revalidate: 3600,
      },
    });

    // response가 JSON이 아닐 가능성(오류 페이지 등)에 대비
    const text = await response.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      // 디버깅용으로 원본 텍스트를 반환
      return NextResponse.json(
        { error: 'Vercel API returned non-JSON response.', raw: text },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error('Vercel API Error:', parsed);
      const errorMessage =
        parsed?.error?.message ||
        parsed?.message ||
        `Failed to fetch Vercel usage data. HTTP ${response.status}`;
      return NextResponse.json({ error: errorMessage, details: parsed }, { status: response.status });
    }

    // 정상 응답인 경우: 그대로 반환
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching Vercel usage:', error);
    return NextResponse.json({ error: 'An internal error occurred while fetching Vercel usage data.' }, { status: 500 });
  }
}
