import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.VERCEL_API_TOKEN!
  const projectId = process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID!
  const teamId = process.env.VERCEL_TEAM_ID // optional

  try {
    const response = await fetch(`https://api.vercel.com/v13/deployments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectId,
        target: 'production'  // 🔥 Git 프로젝트의 최신 커밋을 다시 빌드하여 재배포
      })
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}
