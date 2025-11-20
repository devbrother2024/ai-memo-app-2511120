import { GoogleGenAI } from '@google/genai'

// Gemini API 클라이언트 초기화
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.')
  }

  return new GoogleGenAI({ apiKey })
}

// 메모 요약 생성
export async function generateMemoSummary(
  title: string,
  content: string
): Promise<string> {
  const client = getGeminiClient()

  const prompt = `다음 메모를 한국어로 3문장 이내로 간결하게 요약해주세요.

제목: ${title}

내용:
${content}

요약:`

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    })

    const summary = response.text?.trim()

    if (!summary) {
      throw new Error('요약 생성에 실패했습니다.')
    }

    return summary
  } catch (error) {
    console.error('Gemini API 오류:', error)
    throw new Error(
      error instanceof Error
        ? `요약 생성 중 오류가 발생했습니다: ${error.message}`
        : '요약 생성 중 알 수 없는 오류가 발생했습니다.'
    )
  }
}

// 메모 태그 생성
export async function generateMemoTags(
  title: string,
  content: string
): Promise<string[]> {
  const client = getGeminiClient()

  const prompt = `다음 메모의 내용을 분석하여 적절한 태그를 3~5개 생성해주세요.
태그는 한국어로 작성하고, 메모의 주요 키워드나 주제를 반영해야 합니다.
응답은 JSON 배열 형식으로만 반환해주세요. 설명이나 다른 텍스트는 포함하지 마세요.

예시 형식: ["태그1", "태그2", "태그3"]

제목: ${title}

내용:
${content}

태그 (JSON 배열 형식):`

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    })

    const responseText = response.text?.trim()

    if (!responseText) {
      throw new Error('태그 생성에 실패했습니다: 응답이 비어있습니다.')
    }

    // JSON 배열 파싱 시도
    let tags: string[] = []
    
    // 응답에서 JSON 배열 부분만 추출 (마크다운 코드 블록 제거)
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/)
    const jsonText = jsonMatch ? jsonMatch[0] : responseText

    try {
      tags = JSON.parse(jsonText)
    } catch {
      // JSON 파싱 실패 시 쉼표나 줄바꿈으로 분리 시도
      const cleanedText = jsonText
        .replace(/^\[|\]$/g, '')
        .replace(/"/g, '')
        .trim()
      
      tags = cleanedText
        .split(/[,\n]/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    }

    // 유효성 검사
    if (!Array.isArray(tags) || tags.length === 0) {
      throw new Error('태그 생성에 실패했습니다: 유효한 태그 배열을 생성하지 못했습니다.')
    }

    // 태그 개수 제한 (최대 5개)
    tags = tags.slice(0, 5)

    // 빈 문자열 제거 및 중복 제거
    tags = Array.from(new Set(tags.filter(tag => tag.trim().length > 0)))

    if (tags.length === 0) {
      throw new Error('태그 생성에 실패했습니다: 생성된 태그가 없습니다.')
    }

    return tags
  } catch (error) {
    console.error('Gemini API 오류:', error)
    throw new Error(
      error instanceof Error
        ? `태그 생성 중 오류가 발생했습니다: ${error.message}`
        : '태그 생성 중 알 수 없는 오류가 발생했습니다.'
    )
  }
}


