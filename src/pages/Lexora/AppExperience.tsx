import React, { useEffect, useState } from 'react';
import { SearchRail } from './components/SearchRail';
import { ConceptReader } from './components/ConceptReader';
import { KnowledgeRail } from './components/KnowledgeRail';
import { MOCK_CONCEPTS, RECENT_SEARCHES } from './data';
import { Concept, LearningState } from './types';
import { fetchConceptExplanation } from '../../services/lexoraService';

const STORAGE_KEY_CONCEPTS = 'lexora_concepts_v1';
const STORAGE_KEY_RECENT = 'lexora_recent_searches_v1';
const STORAGE_KEY_ACTIVE = 'lexora_active_id_v1';

export const LexoraExperience: React.FC = () => {
  const [concepts, setConcepts] = useState<Concept[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONCEPTS);
      return saved ? JSON.parse(saved) : MOCK_CONCEPTS;
    } catch {
      return MOCK_CONCEPTS;
    }
  });
  const [recentSearches, setRecentSearches] = useState<{ id: string; english: string; chinese: string; time: string }[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENT);
      return saved ? JSON.parse(saved) : RECENT_SEARCHES;
    } catch {
      return RECENT_SEARCHES;
    }
  });
  const [activeConceptId, setActiveConceptId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ACTIVE) || MOCK_CONCEPTS[0].id;
    } catch {
      return MOCK_CONCEPTS[0].id;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_CONCEPTS, JSON.stringify(concepts)); }, [concepts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recentSearches)); }, [recentSearches]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_ACTIVE, activeConceptId); }, [activeConceptId]);

  const activeConcept = concepts.find((concept) => concept.id === activeConceptId) || concepts[0] || MOCK_CONCEPTS[0];
  const handleSearch = async (query: string) => {
    const existing = concepts.find((concept) => concept.english.toLowerCase() === query.toLowerCase() || concept.chinese.includes(query));
    if (existing) { setActiveConceptId(existing.id); return; }
    setIsLoading(true); setErrorMsg(null);
    try {
      const newConcept = await fetchConceptExplanation(query);
      setConcepts((previous) => [newConcept, ...previous]);
      setActiveConceptId(newConcept.id);
      setRecentSearches((previous) => [{ id: newConcept.id, english: newConcept.english, chinese: newConcept.chinese, time: '刚刚' }, ...previous]);
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : '解释词汇失败，请稍后重试');
    } finally { setIsLoading(false); }
  };
  const handleUpdateLearningState = (conceptId: string, learningState: LearningState) => setConcepts((previous) => previous.map((concept) => concept.id === conceptId ? { ...concept, learningState } : concept));
  const handleDeleteConcept = (conceptId: string) => {
    const nextConcepts = concepts.filter((concept) => concept.id !== conceptId);
    setConcepts(nextConcepts);
    setRecentSearches((previous) => previous.filter((item) => item.id !== conceptId));
    if (activeConceptId === conceptId) setActiveConceptId(nextConcepts[0]?.id || '');
  };

  return <div className="w-full flex-1 flex flex-col md:flex-row bg-ts-canvas" style={{ height: 'calc(100dvh - 72px)' }}>
    <SearchRail recentSearches={recentSearches} activeConceptId={activeConceptId} onSelectConcept={setActiveConceptId} onSearch={handleSearch} onDeleteConcept={handleDeleteConcept} isLoading={isLoading} />
    {errorMsg ? <div className="flex-1 flex flex-col items-center justify-center p-8 text-center"><div className="text-ts-error text-lg mb-2">生成失败</div><div className="text-ts-muted text-sm max-w-md">{errorMsg}</div><button type="button" onClick={() => setErrorMsg(null)} className="mt-4 px-4 py-2 bg-ts-surface shadow-sm rounded-md text-sm text-ts-ink hover:bg-ts-surface-elevated transition-colors">返回</button></div> : <><ConceptReader concept={activeConcept} isLoading={isLoading} recentSearches={recentSearches} activeConceptId={activeConceptId} onSelectConcept={setActiveConceptId} onSearch={handleSearch} onDeleteConcept={handleDeleteConcept} onUpdateLearningState={handleUpdateLearningState} onSelectRelation={handleSearch} /><KnowledgeRail concept={activeConcept} onUpdateLearningState={handleUpdateLearningState} onSelectRelation={handleSearch} /></>}
  </div>;
};
