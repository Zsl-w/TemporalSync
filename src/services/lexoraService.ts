import { Concept } from '../pages/Lexora/types';

export async function fetchConceptExplanation(query: string): Promise<Concept> {
  const response = await fetch('/api/lexora/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data: Concept = await response.json();
  return data;
}

export async function askLexoraTutor(
  concept: Concept,
  question: string
): Promise<string> {
  const response = await fetch('/api/lexora/tutor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conceptEnglish: concept.english,
      conceptChinese: concept.chinese,
      conciseDefinition: concept.conciseDefinition,
      question,
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: '提问失败' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data: { answer: string } = await response.json();
  return data.answer;
}
