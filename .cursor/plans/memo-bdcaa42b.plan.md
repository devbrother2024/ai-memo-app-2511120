<!-- bdcaa42b-8b15-4a88-bc68-ea70e2254c04 736ee456-7863-47e6-86a2-a89ee0a099f1 -->
# 메모 상세 뷰어 추가 계획

## 1. 메모 카드 클릭 이벤트 확장

- `src/components/MemoList.tsx`, `MemoItem.tsx`에 `onSelectMemo`(혹은 유사) 콜백을 추가하고 카드 전체 클릭 시 상세 뷰어가 열리도록 클릭 영역과 `stopPropagation` 처리를 적용합니다.
- 기존 편집/삭제 버튼 동작은 그대로 유지하며, 새로운 상세 보기 콜백에 현재 메모를 전달합니다.

## 2. 메모 상세 모달 컴포넌트 구현

- `src/components`에 `MemoViewerModal.tsx`(가칭)를 생성하여 `memo`, `isOpen`, `onClose`, `onEdit`, `onDelete`를 props로 받아 상세 내용을 표시합니다.
- 모달 내부에 제목/본문/태그/카테고리/작성·수정일을 정갈히 보여주고, 하단에 편집·삭제 버튼을 배치합니다.
- `useEffect`로 ESC 키 입력 시 `onClose` 호출, 배경 클릭 시 닫히도록 레이어를 구성합니다.

## 3. 페이지 상태 및 핸들러 연동

- `src/app/page.tsx`에 `selectedMemo` 상태와 `handleViewMemo`/`handleCloseViewer`를 추가하고, `MemoList`에 상세 보기 콜백을 전달합니다.
- `MemoViewerModal`을 페이지에 포함시켜 `selectedMemo`가 있을 때만 렌더링하고, 모달 내 편집 버튼에서 기존 폼 모달을 열도록 연계하며 삭제 버튼은 재사용 handler를 호출합니다.

### To-dos

- [ ] 카드 클릭 시 상세 보기 콜백 전달
- [ ] 메모 상세 모달 컴포넌트 구현
- [ ] 페이지 상태와 핸들러에 모달 연동