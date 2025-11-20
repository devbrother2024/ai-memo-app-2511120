'use client'

import { Memo, MEMO_CATEGORIES } from '@/types/memo'

interface MemoItemProps {
  memo: Memo
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
  onSelect: (memo: Memo) => void
}

export default function MemoItem({
  memo,
  onEdit,
  onDelete,
  onSelect,
}: MemoItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    // 글래스모피즘에 어울리는 반투명 뱃지 스타일
    const colors = {
      personal: 'bg-blue-500/20 text-blue-100 border border-blue-400/30',
      work: 'bg-green-500/20 text-green-100 border border-green-400/30',
      study: 'bg-purple-500/20 text-purple-100 border border-purple-400/30',
      idea: 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30',
      other: 'bg-gray-500/20 text-gray-100 border border-gray-400/30',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleActionClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    callback: () => void,
  ) => {
    event.stopPropagation()
    callback()
  }

  return (
    <div
      className="glass-card rounded-xl p-6 hover:bg-white/30 transition-all duration-200 cursor-pointer group"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(memo)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(memo)
        }
      }}
    >
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 drop-shadow-sm">
            {memo.title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
            >
              {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                memo.category}
            </span>
            <span className="text-xs text-white/70">
              {formatDate(memo.updatedAt)}
            </span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={event =>
              handleActionClick(event, () => {
                onEdit(memo)
              })
            }
            className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            title="편집"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={event =>
              handleActionClick(event, () => {
                if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
                  onDelete(memo.id)
                }
              })
            }
            className="p-2 text-white/70 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
            title="삭제"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 내용 */}
      <div className="mb-4">
        <p className="text-white/90 text-sm leading-relaxed line-clamp-3 font-medium">
          {memo.content}
        </p>
      </div>

      {/* 태그 */}
      {memo.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {memo.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/10 text-white/90 text-xs rounded-md border border-white/20"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
