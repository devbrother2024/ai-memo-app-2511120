'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import { getSupabaseClient } from '@/lib/supabaseClient'

// SSR 방지를 위한 동적 import
const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview'),
  {
    ssr: false,
  }
)

interface MemoViewerModalProps {
  memo: Memo | null
  isOpen: boolean
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoViewerModal({
  memo,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: MemoViewerModalProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [isLoadingSavedSummary, setIsLoadingSavedSummary] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // 모달이 열릴 때 DB에서 저장된 요약 가져오기
  useEffect(() => {
    if (!isOpen || !memo) return

    const loadSavedSummary = async () => {
      setIsLoadingSavedSummary(true)
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from('memos')
          .select('summary')
          .eq('id', memo.id)
          .single<{ summary: string | null }>()

        if (error) {
          console.error('요약 로드 실패:', error)
          return
        }

        if (data?.summary) {
          setSummary(data.summary)
        }
      } catch (error) {
        console.error('요약 로드 중 오류:', error)
      } finally {
        setIsLoadingSavedSummary(false)
      }
    }

    loadSavedSummary()
  }, [isOpen, memo])

  // 모달이 닫힐 때 요약 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSummary(null)
      setSummaryError(null)
      setIsLoadingSummary(false)
    }
  }, [isOpen])

  if (!isOpen || !memo) return null

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
    }
  }

  const handleGenerateSummary = async () => {
    if (!memo) return

    setIsLoadingSummary(true)
    setSummaryError(null)

    try {
      const response = await fetch('/api/memos/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memoId: memo.id, // 메모 ID를 포함하여 DB에 저장
          title: memo.title,
          content: memo.content,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '요약 생성에 실패했습니다.')
      }

      // 요약 생성 및 저장 성공
      setSummary(data.summary)
    } catch (error) {
      console.error('요약 생성 오류:', error)
      setSummaryError(
        error instanceof Error
          ? error.message
          : '요약 생성 중 오류가 발생했습니다.'
      )
    } finally {
      setIsLoadingSummary(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={event => event.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-3">
              {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES]}
            </span>
            <h2 className="text-2xl font-bold text-gray-900">{memo.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 요약 섹션 */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">AI 요약</h3>
              <button
                onClick={handleGenerateSummary}
                disabled={isLoadingSummary}
                className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingSummary ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>요약 생성 중...</span>
                  </>
                ) : summary ? (
                  <span>다시 요약</span>
                ) : (
                  <span>요약 생성</span>
                )}
              </button>
            </div>
            {summaryError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {summaryError}
              </div>
            )}
            {summary && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-gray-800 leading-relaxed">{summary}</p>
              </div>
            )}
            {!summary && !isLoadingSummary && !summaryError && !isLoadingSavedSummary && (
              <p className="text-sm text-gray-400 italic">
                AI를 통해 메모를 요약할 수 있습니다.
              </p>
            )}
            {isLoadingSavedSummary && (
              <p className="text-sm text-gray-400 italic">저장된 요약을 불러오는 중...</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">내용</h3>
            <div data-color-mode="light" className="markdown-viewer">
              <MarkdownPreview source={memo.content} />
            </div>
          </div>

          {memo.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">태그</h3>
              <div className="flex flex-wrap gap-2">
                {memo.tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-500 block mb-1">
                작성일
              </span>
              <span>{formatDateTime(memo.createdAt)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500 block mb-1">
                최근 수정일
              </span>
              <span>{formatDateTime(memo.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end p-6 border-t border-gray-100">
          <button
            onClick={handleDelete}
            className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            삭제
          </button>
          <button
            onClick={() => onEdit(memo)}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            편집
          </button>
        </div>
      </div>
    </div>
  )
}

