import { createClient } from '@supabase/supabase-js'
import { Memo } from '@/types/memo'

// Supabase 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      memos: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          tags: string[]
          summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: string
          tags?: string[]
          summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          tags?: string[]
          summary?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Supabase 클라이언트 생성
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// 브라우저용 클라이언트 (클라이언트 컴포넌트에서 사용)
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient는 클라이언트 컴포넌트에서만 사용할 수 있습니다.')
  }
  return createSupabaseClient()
}

// Memo 타입 변환 헬퍼 함수
export function mapDbMemoToMemo(dbMemo: Database['public']['Tables']['memos']['Row']): Memo {
  return {
    id: dbMemo.id,
    title: dbMemo.title,
    content: dbMemo.content,
    category: dbMemo.category,
    tags: dbMemo.tags || [],
    createdAt: dbMemo.created_at,
    updatedAt: dbMemo.updated_at,
  }
}


