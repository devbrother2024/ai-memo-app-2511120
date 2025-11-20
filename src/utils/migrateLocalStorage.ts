import { Memo } from '@/types/memo'
import { localStorageUtils } from './localStorage'
import { getSupabaseClient, mapDbMemoToMemo } from '@/lib/supabaseClient'

/**
 * 로컬스토리지의 메모 데이터를 Supabase로 마이그레이션합니다.
 * 이미 Supabase에 데이터가 있는 경우 마이그레이션을 건너뜁니다.
 *
 * @returns 마이그레이션된 메모 개수
 */
export async function migrateLocalStorageToSupabase(): Promise<number> {
  if (typeof window === 'undefined') {
    throw new Error('이 함수는 브라우저 환경에서만 실행할 수 있습니다.')
  }

  try {
    const supabase = getSupabaseClient()

    // 기존 Supabase 데이터 확인
    const { data: existingData, error: checkError } = await supabase
      .from('memos')
      .select('id')
      .limit(1)

    if (checkError) {
      throw checkError
    }

    // 이미 데이터가 있으면 마이그레이션 건너뛰기
    if (existingData && existingData.length > 0) {
      console.log('Supabase에 이미 데이터가 있습니다. 마이그레이션을 건너뜁니다.')
      return 0
    }

    // 로컬스토리지에서 메모 가져오기
    const localMemos = localStorageUtils.getMemos()

    if (localMemos.length === 0) {
      console.log('로컬스토리지에 마이그레이션할 데이터가 없습니다.')
      return 0
    }

    // Supabase에 삽입할 데이터 형식으로 변환
    const memosToInsert = localMemos.map(memo => ({
      id: memo.id, // UUID 형식이어야 함
      title: memo.title,
      content: memo.content,
      category: memo.category,
      tags: memo.tags || [],
      summary: null, // 로컬스토리지에는 summary가 없으므로 null
      created_at: memo.createdAt,
      updated_at: memo.updatedAt,
    }))

    // 배치로 삽입 (Supabase는 한 번에 최대 1000개까지 삽입 가능)
    const batchSize = 1000
    let migratedCount = 0

    for (let i = 0; i < memosToInsert.length; i += batchSize) {
      const batch = memosToInsert.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('memos')
        .insert(batch)
        .select()

      if (error) {
        console.error(`배치 ${i / batchSize + 1} 삽입 실패:`, error)
        throw error
      }

      migratedCount += data?.length || 0
    }

    console.log(`성공적으로 ${migratedCount}개의 메모를 Supabase로 마이그레이션했습니다.`)

    // 마이그레이션 성공 후 로컬스토리지 데이터 삭제 (선택사항)
    // 주석을 해제하면 마이그레이션 후 로컬스토리지 데이터가 삭제됩니다.
    // localStorageUtils.clearMemos()
    // console.log('로컬스토리지 데이터를 삭제했습니다.')

    return migratedCount
  } catch (error) {
    console.error('마이그레이션 중 오류 발생:', error)
    throw error
  }
}

/**
 * 마이그레이션 상태 확인
 */
export async function checkMigrationStatus(): Promise<{
  hasLocalData: boolean
  hasSupabaseData: boolean
  localCount: number
  supabaseCount: number
}> {
  if (typeof window === 'undefined') {
    throw new Error('이 함수는 브라우저 환경에서만 실행할 수 있습니다.')
  }

  const localMemos = localStorageUtils.getMemos()
  const localCount = localMemos.length

  try {
    const supabase = getSupabaseClient()
    const { count, error } = await supabase
      .from('memos')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw error
    }

    return {
      hasLocalData: localCount > 0,
      hasSupabaseData: (count || 0) > 0,
      localCount,
      supabaseCount: count || 0,
    }
  } catch (error) {
    console.error('마이그레이션 상태 확인 실패:', error)
    return {
      hasLocalData: localCount > 0,
      hasSupabaseData: false,
      localCount,
      supabaseCount: 0,
    }
  }
}


