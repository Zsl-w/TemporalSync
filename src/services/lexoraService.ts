import { parseConcept, parseTutorAnswer } from '../../shared/lexora-validation';
import type { Concept } from '../pages/Lexora/types';

export async function fetchConceptExplanation(query: string): Promise<Concept> {
  const response = await fetch('/api/lexora/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return parseConcept(await response.json());
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
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: '提问失败' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return parseTutorAnswer(await response.json());
}
