# 📝 메모 앱 (Memo App)

**핸즈온 실습용 Next.js 메모 애플리케이션**

Supabase 데이터베이스 기반의 완전한 CRUD 기능을 갖춘 메모 앱으로, MCP 연동 및 GitHub PR 생성 실습의 기반이 되는 프로젝트입니다.

## 🚀 주요 기능

- ✅ 메모 생성, 읽기, 수정, 삭제 (CRUD)
- 📂 카테고리별 메모 분류 (개인, 업무, 학습, 아이디어, 기타)
- 🏷️ 태그 시스템으로 메모 태깅
- 🔍 제목, 내용, 태그 기반 실시간 검색
- 📱 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 💾 Supabase 데이터베이스 기반 데이터 저장
- 🤖 AI 기반 메모 요약 기능 (Gemini API)
- 🎨 모던한 UI/UX with Tailwind CSS

## 🛠 기술 스택

- **Framework**: Next.js 15.4.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Package Manager**: npm

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# .env.example 파일을 복사하여 .env.local 생성
cp .env.example .env.local
```

필수 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
- `GEMINI_API_KEY`: Google Gemini API 키 (AI 요약 기능용)

환경 변수는 [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api)에서 확인할 수 있습니다.

### 3. Supabase 데이터베이스 설정

#### 마이그레이션 적용

Supabase MCP를 사용하여 데이터베이스 마이그레이션을 적용합니다:

```bash
# Supabase MCP를 통해 마이그레이션 적용 (이미 적용됨)
# 또는 Supabase CLI 사용:
# supabase db push
```

#### 시드 데이터 확인

시드 데이터는 자동으로 삽입됩니다. 수동으로 확인하려면:

```sql
-- Supabase SQL Editor에서 실행
SELECT COUNT(*) FROM memos;
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 브라우저 접속

```
http://localhost:3000
```

### 6. 로컬스토리지 데이터 마이그레이션 (선택사항)

기존 로컬스토리지에 데이터가 있는 경우, 브라우저 콘솔에서 다음을 실행하여 Supabase로 마이그레이션할 수 있습니다:

```typescript
import { migrateLocalStorageToSupabase } from '@/utils/migrateLocalStorage'

// 마이그레이션 실행
migrateLocalStorageToSupabase()
  .then(count => console.log(`${count}개의 메모가 마이그레이션되었습니다.`))
  .catch(error => console.error('마이그레이션 실패:', error))
```

## 📁 프로젝트 구조

```
memo-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── memos/
│   │   │       └── summary/
│   │   │           └── route.ts    # AI 요약 API
│   │   ├── globals.css              # 글로벌 스타일
│   │   ├── layout.tsx               # 루트 레이아웃
│   │   └── page.tsx                 # 메인 페이지
│   ├── components/
│   │   ├── MemoForm.tsx             # 메모 생성/편집 폼
│   │   ├── MemoItem.tsx             # 개별 메모 카드
│   │   ├── MemoList.tsx             # 메모 목록 및 필터
│   │   └── MemoViewerModal.tsx     # 메모 상세 뷰어
│   ├── hooks/
│   │   └── useMemos.ts              # 메모 관리 커스텀 훅
│   ├── lib/
│   │   ├── supabaseClient.ts        # Supabase 클라이언트 설정
│   │   └── gemini.ts                # Gemini API 클라이언트
│   ├── types/
│   │   └── memo.ts                  # 메모 타입 정의
│   └── utils/
│       ├── localStorage.ts          # LocalStorage 유틸리티 (레거시)
│       ├── seedData.ts              # 샘플 데이터 시딩 (레거시)
│       └── migrateLocalStorage.ts   # 로컬스토리지 마이그레이션 유틸
└── README.md                        # 프로젝트 문서
```

## 💡 주요 컴포넌트

### MemoItem

- 개별 메모를 카드 형태로 표시
- 편집/삭제 액션 버튼
- 카테고리 배지 및 태그 표시
- 날짜 포맷팅 및 텍스트 클램핑

### MemoForm

- 메모 생성/편집을 위한 모달 폼
- 제목, 내용, 카테고리, 태그 입력
- 태그 추가/제거 기능
- 폼 검증 및 에러 처리

### MemoList

- 메모 목록 그리드 표시
- 실시간 검색 및 카테고리 필터링
- 통계 정보 및 빈 상태 처리
- 반응형 그리드 레이아웃

## 📊 데이터 구조

```typescript
interface Memo {
  id: string // 고유 식별자
  title: string // 메모 제목
  content: string // 메모 내용
  category: string // 카테고리 (personal, work, study, idea, other)
  tags: string[] // 태그 배열
  createdAt: string // 생성 날짜 (ISO string)
  updatedAt: string // 수정 날짜 (ISO string)
}
```

## 🎯 실습 시나리오

이 프로젝트는 다음 3가지 실습의 기반으로 사용됩니다:

### 실습 1: Supabase MCP 마이그레이션 ✅ (완료)

- ✅ LocalStorage → Supabase 데이터베이스 전환
- ✅ MCP를 통한 자동 스키마 생성
- ✅ 기존 데이터 무손실 마이그레이션
- ✅ AI 요약 데이터베이스 저장

### 실습 2: 기능 확장 + GitHub PR (60분)

- 메모 즐겨찾기 기능 추가
- Cursor Custom Modes로 PR 생성
- 코드 리뷰 및 협업 실습

### 실습 3: Playwright MCP 테스트 (45분)

- E2E 테스트 작성
- 브라우저 자동화 및 시각적 테스트
- 성능 측정 및 리포트

자세한 실습 가이드는 강의자료를 참고하세요.

## 🎨 샘플 데이터

앱 첫 실행 시 6개의 샘플 메모가 자동으로 생성됩니다:

- 프로젝트 회의 준비 (업무)
- React 18 새로운 기능 학습 (학습)
- 새로운 앱 아이디어: 습관 트래커 (아이디어)
- 주말 여행 계획 (개인)
- 독서 목록 (개인)
- 성능 최적화 아이디어 (아이디어)

## 🔧 개발 가이드

### 메모 CRUD 작업

```typescript
// useMemos 훅 사용 예시
const {
  memos, // 필터링된 메모 목록
  loading, // 로딩 상태
  createMemo, // 메모 생성
  updateMemo, // 메모 수정
  deleteMemo, // 메모 삭제
  searchMemos, // 검색
  filterByCategory, // 카테고리 필터링
  stats, // 통계 정보
} = useMemos()
```

### Supabase 직접 조작

```typescript
import { getSupabaseClient } from '@/lib/supabaseClient'

// Supabase 클라이언트 가져오기
const supabase = getSupabaseClient()

// 모든 메모 가져오기
const { data, error } = await supabase
  .from('memos')
  .select('*')
  .order('created_at', { ascending: false })

// 메모 추가
const { data: newMemo, error } = await supabase
  .from('memos')
  .insert({
    title: '새 메모',
    content: '내용',
    category: 'personal',
    tags: ['태그1', '태그2'],
  })
  .select()
  .single()

// 메모 검색
const { data: results } = await supabase
  .from('memos')
  .select('*')
  .or(`title.ilike.%React%,content.ilike.%React%`)
```

### 로컬스토리지에서 Supabase로 마이그레이션

```typescript
import { migrateLocalStorageToSupabase, checkMigrationStatus } from '@/utils/migrateLocalStorage'

// 마이그레이션 상태 확인
const status = await checkMigrationStatus()
console.log('로컬 데이터:', status.localCount, 'Supabase 데이터:', status.supabaseCount)

// 마이그레이션 실행
if (status.hasLocalData && !status.hasSupabaseData) {
  const count = await migrateLocalStorageToSupabase()
  console.log(`${count}개의 메모가 마이그레이션되었습니다.`)
}
```

## 🚀 배포

### Vercel 배포

```bash
npm run build
npx vercel --prod
```

### Netlify 배포

```bash
npm run build
# dist 폴더를 Netlify에 드래그 앤 드롭
```

## 📄 라이선스

MIT License - 학습 및 실습 목적으로 자유롭게 사용 가능합니다.

## 🤝 기여

이 프로젝트는 교육용으로 제작되었습니다. 개선사항이나 버그 리포트는 이슈나 PR로 제출해 주세요.

---

**Made with ❤️ for hands-on workshop**
