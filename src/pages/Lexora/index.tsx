import React, { useState, useEffect } from 'react';
import { SearchRail } from './components/SearchRail';
import { ConceptReader } from './components/ConceptReader';
import { KnowledgeRail } from './components/KnowledgeRail';
import { MOCK_CONCEPTS, RECENT_SEARCHES } from './data';
import { Concept, LearningState } from './types';
import { fetchConceptExplanation } from '../../services/lexoraService';

const STORAGE_KEY_CONCEPTS = 'lexora_concepts_v1';
const STORAGE_KEY_RECENT = 'lexora_recent_searches_v1';
const STORAGE_KEY_ACTIVE = 'lexora_active_id_v1';

export const Lexora: React.FC = () => {
  const [concepts, setConcepts] = useState<Concept[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_CONCEPTS);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load concepts from localStorage', e);
      }
    }
    return MOCK_CONCEPTS;
  });

  const [recentSearches, setRecentSearches] = useState<{ id: string; english: string; chinese: string; time: string }[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_RECENT);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load recent searches from localStorage', e);
      }
    }
    return RECENT_SEARCHES;
  });

  const [activeConceptId, setActiveConceptId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
        if (saved) return saved;
      } catch (e) {
        console.error('Failed to load active concept ID from localStorage', e);
      }
    }
    return MOCK_CONCEPTS[0].id;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONCEPTS, JSON.stringify(concepts));
    } catch (e) {
      console.error('Failed to save concepts', e);
    }
  }, [concepts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recentSearches));
    } catch (e) {
      console.error('Failed to save recent searches', e);
    }
  }, [recentSearches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeConceptId);
    } catch (e) {
      console.error('Failed to save active concept ID', e);
    }
  }, [activeConceptId]);

  const activeConcept = concepts.find(c => c.id === activeConceptId) || concepts[0] || MOCK_CONCEPTS[0];

  const handleSearch = async (query: string) => {
    const existing = concepts.find(
      c => c.english.toLowerCase() === query.toLowerCase() || c.chinese.includes(query)
    );
    if (existing) {
      setActiveConceptId(existing.id);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const newConcept = await fetchConceptExplanation(query);
      setConcepts(prev => [newConcept, ...prev]);
      setActiveConceptId(newConcept.id);
      setRecentSearches(prev => [
        { id: newConcept.id, english: newConcept.english, chinese: newConcept.chinese, time: '刚刚' },
        ...prev,
      ]);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : '解释词汇失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLearningState = (conceptId: string, newState: LearningState) => {
    setConcepts(prev =>
      prev.map(c => (c.id === conceptId ? { ...c, learningState: newState } : c))
    );
  };

  const handleDeleteConcept = (conceptId: string) => {
    const nextConcepts = concepts.filter(c => c.id !== conceptId);
    const nextRecent = recentSearches.filter(r => r.id !== conceptId);

    setConcepts(nextConcepts);
    setRecentSearches(nextRecent);

    if (activeConceptId === conceptId) {
      if (nextConcepts.length > 0) {
        setActiveConceptId(nextConcepts[0].id);
      } else {
        setActiveConceptId('');
      }
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row bg-ts-canvas" style={{ height: 'calc(100dvh - 72px)' }}>
      <SearchRail 
        recentSearches={recentSearches}
        activeConceptId={activeConceptId}
        onSelectConcept={setActiveConceptId}
        onSearch={handleSearch}
        onDeleteConcept={handleDeleteConcept}
        isLoading={isLoading}
      />
      {errorMsg ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-ts-error text-lg mb-2">生成失败</div>
          <div className="text-ts-muted text-sm max-w-md">{errorMsg}</div>
          <button 
            onClick={() => setErrorMsg(null)}
            className="mt-4 px-4 py-2 bg-ts-surface shadow-sm rounded-md text-sm text-ts-ink hover:bg-ts-surface-elevated transition-colors"
          >
            返回
          </button>
        </div>
      ) : (
        <>
          <ConceptReader concept={activeConcept} isLoading={isLoading} />
          <KnowledgeRail 
            concept={activeConcept} 
            onUpdateLearningState={handleUpdateLearningState}
            onSelectRelation={handleSearch}
          />
        </>
      )}
    </div>
  );
};
