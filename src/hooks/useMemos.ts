'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Memo, MemoFormData } from '@/types/memo'
import { getSupabaseClient, mapDbMemoToMemo } from '@/lib/supabaseClient'
import type { Database } from '@/lib/supabaseClient'

type DbMemoRow = Database['public']['Tables']['memos']['Row']

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 메모 로드
  useEffect(() => {
    const loadMemos = async () => {
      setLoading(true)
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from('memos')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Failed to load memos:', error)
          setMemos([])
        } else {
          const memoRows = (data ?? []) as DbMemoRow[]
          const mappedMemos = memoRows.map(mapDbMemoToMemo)
          setMemos(mappedMemos)
        }
      } catch (error) {
        console.error('Failed to load memos:', error)
        setMemos([])
      } finally {
        setLoading(false)
      }
    }

    loadMemos()
  }, [])

  // 메모 생성
  const createMemo = useCallback(async (formData: MemoFormData): Promise<Memo> => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('memos')
        .insert<Database['public']['Tables']['memos']['Insert']>({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags: formData.tags || [],
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('메모 생성 결과가 비어 있습니다.')
      }
      const newMemo = mapDbMemoToMemo(data as DbMemoRow)
      setMemos(prev => [newMemo, ...prev])
      return newMemo
    } catch (error) {
      console.error('Failed to create memo:', error)
      throw error
    }
  }, [])

  // 메모 업데이트
  const updateMemo = useCallback(
    async (id: string, formData: MemoFormData): Promise<void> => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from('memos')
          .update<Database['public']['Tables']['memos']['Update']>({
            title: formData.title,
            content: formData.content,
            category: formData.category,
            tags: formData.tags || [],
          })
          .eq('id', id)
          .select()
          .single()

        if (error) {
          throw error
        }

        if (!data) {
          throw new Error('메모 업데이트 결과가 비어 있습니다.')
        }
        const updatedMemo = mapDbMemoToMemo(data as DbMemoRow)
        setMemos(prev => prev.map(memo => (memo.id === id ? updatedMemo : memo)))
      } catch (error) {
        console.error('Failed to update memo:', error)
        throw error
      }
    },
    []
  )

  // 메모 삭제
  const deleteMemo = useCallback(async (id: string): Promise<void> => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('memos').delete().eq('id', id)

      if (error) {
        throw error
      }

      setMemos(prev => prev.filter(memo => memo.id !== id))
    } catch (error) {
      console.error('Failed to delete memo:', error)
      throw error
    }
  }, [])

  // 메모 검색
  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  // 카테고리 필터링
  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  // 특정 메모 가져오기
  const getMemoById = useCallback(
    (id: string): Memo | undefined => {
      return memos.find(memo => memo.id === id)
    },
    [memos]
  )

  // 필터링된 메모 목록
  const filteredMemos = useMemo(() => {
    let filtered = memos

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [memos, selectedCategory, searchQuery])

  // 모든 메모 삭제
  const clearAllMemos = useCallback(async (): Promise<void> => {
    try {
      const supabase = getSupabaseClient()
      // 모든 메모 삭제 (모든 행을 선택하는 조건 사용)
      const { error } = await supabase.from('memos').delete().gte('created_at', '1970-01-01')

      if (error) {
        throw error
      }

      setMemos([])
      setSearchQuery('')
      setSelectedCategory('all')
    } catch (error) {
      console.error('Failed to clear all memos:', error)
      throw error
    }
  }, [])

  // 통계 정보
  const stats = useMemo(() => {
    const totalMemos = memos.length
    const categoryCounts = memos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: totalMemos,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    // 상태
    memos: filteredMemos,
    allMemos: memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,

    // 메모 CRUD
    createMemo,
    updateMemo,
    deleteMemo,
    getMemoById,

    // 필터링 & 검색
    searchMemos,
    filterByCategory,

    // 유틸리티
    clearAllMemos,
  }
}
