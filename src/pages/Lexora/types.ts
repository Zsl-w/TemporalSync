export type LearningState = 'new' | 'learning' | 'mastered' | 'review';

export interface KnowledgeRelation {
  id: string;
  type: 'prerequisite' | 'current' | 'derived' | 'analogy';
  english: string;
  chinese: string;
}

export interface Concept {
  id: string;
  domain: string;
  english: string;
  chinese: string;
  pronunciation: string;
  conciseDefinition: string;
  deepExplanation: string[];
  learningState: LearningState;
  lastReviewedAt?: string;
  relations: KnowledgeRelation[];
}
