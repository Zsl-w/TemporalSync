import { isRecord } from './neuro-feed';
import type { Concept } from '../src/pages/Lexora/types';

export function parseExplainInput(value: unknown): { query: string } {
  if (!isRecord(value) || typeof value.query !== 'string' || !value.query.trim() || value.query.length > 2000) {
    throw new Error('Query must be a non-empty string of at most 2000 characters');
  }
  return { query: value.query.trim() };
}

export function parseTutorInput(value: unknown): { question: string; conceptEnglish: string; conceptChinese: string; conciseDefinition: string } {
  if (!isRecord(value) || typeof value.question !== 'string' || !value.question.trim() || value.question.length > 2000) {
    throw new Error('Question must be a non-empty string of at most 2000 characters');
  }
  const result = { question: value.question.trim(), conceptEnglish: '', conceptChinese: '', conciseDefinition: '' };
  for (const key of ['conceptEnglish', 'conceptChinese', 'conciseDefinition'] as const) {
    if (value[key] === undefined) continue;
    if (typeof value[key] !== 'string' || value[key].length > 4000) throw new Error('Invalid concept context');
    result[key] = value[key];
  }
  return result;
}

export function parseConcept(value: unknown): Concept {
  if (!isRecord(value) || !['id', 'domain', 'english', 'chinese', 'pronunciation', 'conciseDefinition'].every((key) => typeof value[key] === 'string') ||
    typeof value.id !== 'string' || !value.id.trim() || !Array.isArray(value.deepExplanation) ||
    !value.deepExplanation.every((text) => typeof text === 'string') || !Array.isArray(value.relations) ||
    !value.relations.every((relation) => isRecord(relation) && ['id', 'english', 'chinese'].every((key) => typeof relation[key] === 'string') &&
      ['prerequisite', 'current', 'derived', 'analogy'].includes(String(relation.type)))) throw new Error('Invalid concept response');
  return { ...value, learningState: 'new' } as unknown as Concept;
}

export function parseTutorAnswer(value: unknown): string {
  if (!isRecord(value) || typeof value.answer !== 'string' || !value.answer.trim()) throw new Error('Invalid tutor response');
  return value.answer;
}

export function completionText(value: unknown): string {
  if (!isRecord(value) || !Array.isArray(value.choices) || !isRecord(value.choices[0]) ||
    !isRecord(value.choices[0].message) || typeof value.choices[0].message.content !== 'string' || !value.choices[0].message.content.trim()) {
    throw new Error('Invalid upstream completion');
  }
  return value.choices[0].message.content;
}
