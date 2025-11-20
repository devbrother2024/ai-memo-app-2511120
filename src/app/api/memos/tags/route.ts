import { NextRequest, NextResponse } from 'next/server'
import { generateMemoTags } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content } = body

    // 입력 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    // 태그 생성
    const tags = await generateMemoTags(title, content)

    return NextResponse.json({
      tags,
      success: true,
    })
  } catch (error) {
    console.error('태그 생성 API 오류:', error)

    // 환경 변수 누락 체크
    if (
      error instanceof Error &&
      error.message.includes('GEMINI_API_KEY')
    ) {
      return NextResponse.json(
        {
          error: '서버 설정 오류: API 키가 설정되지 않았습니다.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '태그 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

