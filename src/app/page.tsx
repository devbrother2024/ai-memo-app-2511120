'use client'

import { useState } from 'react'
import { useMemos } from '@/hooks/useMemos'
import { Memo, MemoFormData } from '@/types/memo'
import MemoList from '@/components/MemoList'
import MemoForm from '@/components/MemoForm'
import MemoViewerModal from '@/components/MemoViewerModal'

export default function Home() {
  const {
    memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,
    createMemo,
    updateMemo,
    deleteMemo,
    searchMemos,
    filterByCategory,
  } = useMemos()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null)
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null)

  const handleCreateMemo = async (formData: MemoFormData) => {
    try {
      await createMemo(formData)
      setIsFormOpen(false)
    } catch (error) {
      console.error('메모 생성 실패:', error)
      alert('메모 생성에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleUpdateMemo = async (formData: MemoFormData) => {
    if (editingMemo) {
      try {
        await updateMemo(editingMemo.id, formData)
        setEditingMemo(null)
      } catch (error) {
        console.error('메모 수정 실패:', error)
        alert('메모 수정에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }

  const handleEditMemo = (memo: Memo) => {
    setSelectedMemo(null)
    setEditingMemo(memo)
    setIsFormOpen(true)
  }

  const handleDeleteMemo = async (id: string) => {
    try {
      await deleteMemo(id)
      setSelectedMemo(prev => (prev?.id === id ? null : prev))
    } catch (error) {
      console.error('메모 삭제 실패:', error)
      alert('메모 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingMemo(null)
  }

  const handleViewMemo = (memo: Memo) => {
    setSelectedMemo(memo)
  }

  const handleCloseViewer = () => {
    setSelectedMemo(null)
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 glass-panel border-b-0 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-white drop-shadow-md">
                  📝 메모 앱
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white glass-button transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                새 메모
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <MemoList
          memos={memos}
          loading={loading}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={searchMemos}
          onCategoryChange={filterByCategory}
          onEditMemo={handleEditMemo}
          onDeleteMemo={handleDeleteMemo}
          onSelectMemo={handleViewMemo}
          stats={stats}
        />
      </main>

      {/* 모달 폼 */}
      <MemoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingMemo ? handleUpdateMemo : handleCreateMemo}
        editingMemo={editingMemo}
      />

      {/* 메모 상세 뷰어 */}
      <MemoViewerModal
        memo={selectedMemo}
        isOpen={!!selectedMemo}
        onClose={handleCloseViewer}
        onEdit={handleEditMemo}
        onDelete={handleDeleteMemo}
      />
    </div>
  )
}
