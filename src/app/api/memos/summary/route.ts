import { NextRequest, NextResponse } from 'next/server'
import { generateMemoSummary } from '@/lib/gemini'
import { createSupabaseClient } from '@/lib/supabaseClient'
import type { Database } from '@/lib/supabaseClient'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memoId, title, content } = body

    // 입력 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    // 요약 생성
    const summary = await generateMemoSummary(title, content)

    // 메모 ID가 제공된 경우 데이터베이스에 저장
    if (memoId) {
      try {
        const supabase = createSupabaseClient() as SupabaseClient<Database>
        const { error: updateError } = await supabase
          .from('memos')
          // Supabase 타입 정의 이슈로 인해 두 번 캐스팅하여 컴파일 오류를 회피한다.
          .update({
            summary,
          } as Database['public']['Tables']['memos']['Update'] as never)
          .eq('id', memoId)

        if (updateError) {
          console.error('요약 저장 실패:', updateError)
          // 요약 생성은 성공했지만 저장 실패한 경우에도 요약은 반환
          // 클라이언트에서 요약을 볼 수 있도록 함
        } else {
          console.log('요약이 데이터베이스에 성공적으로 저장되었습니다.')
        }
      } catch (dbError) {
        console.error('데이터베이스 업데이트 오류:', dbError)
        // 요약 생성은 성공했지만 저장 실패한 경우에도 요약은 반환
      }
    }

    return NextResponse.json({
      summary,
      success: true,
    })
  } catch (error) {
    console.error('요약 API 오류:', error)

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
            : '요약 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

