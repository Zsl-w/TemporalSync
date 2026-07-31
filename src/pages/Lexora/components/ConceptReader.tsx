import React, { useState } from 'react';
import { Volume2, Loader2, Sparkles, Search, X, CheckCircle2, Clock, Network } from 'lucide-react';
import { Concept, LearningState } from '../types';
import { AITutor } from './AITutor';

interface ConceptReaderProps {
  concept: Concept;
  isLoading?: boolean;
  recentSearches?: { id: string; english: string; chinese: string; time: string }[];
  activeConceptId?: string;
  onSelectConcept?: (id: string) => void;
  onSearch?: (query: string) => void;
  onDeleteConcept?: (id: string) => void;
  onUpdateLearningState?: (conceptId: string, newState: LearningState) => void;
  onSelectRelation?: (englishTerm: string) => void;
}

export const ConceptReader: React.FC<ConceptReaderProps> = ({
  concept,
  isLoading,
  recentSearches,
  activeConceptId,
  onSelectConcept,
  onSearch,
  onUpdateLearningState,
  onSelectRelation,
}) => {
  const [readingMode, setReadingMode] = useState<'simple' | 'deep' | 'tutor'>('simple');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [mobileQuery, setMobileQuery] = useState('');

  const handlePlayPronunciation = () => {
    setIsPlayingAudio(true);

    // Primary: Authentic English audio stream (type=2 for US accent)
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(concept.english)}&type=2`;
    const audio = new Audio(audioUrl);

    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => fallbackWebSpeech();

    audio.play().catch(() => {
      fallbackWebSpeech();
    });

    function fallbackWebSpeech() {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setIsPlayingAudio(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(concept.english);
      const voices = window.speechSynthesis.getVoices();
      
      const englishVoice = voices.find(
        v => v.lang.startsWith('en') && (
          v.name.includes('Samantha') || 
          v.name.includes('Alex') || 
          v.name.includes('Google US') || 
          v.name.includes('Natural') ||
          v.name.includes('Ava')
        )
      ) || voices.find(v => v.lang.startsWith('en'));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-w-0 md:min-w-[640px] w-full px-5 py-6 md:px-[46px] md:py-[42px] 2xl:px-[56px] overflow-y-auto relative bg-ts-canvas">
        <div className="max-w-[760px] mx-auto w-full flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={36} className="animate-spin text-lexora-accent" />
          <span className="text-sm font-medium text-ts-muted tracking-wider">DeepSeek 正在生成专业概念解析...</span>
        </div>
      </div>
    );
  }

  const isReviewing = concept.learningState === 'review';
  const isMastered = concept.learningState === 'mastered';

  return (
    <div className="flex-1 flex flex-col min-w-0 md:min-w-[640px] w-full px-5 py-6 md:px-[46px] md:py-[42px] 2xl:px-[56px] overflow-y-auto relative bg-ts-canvas">
      <div className="max-w-[760px] mx-auto w-full">

        {/* Mobile Top Search & History Bar (< md) */}
        <div className="md:hidden mb-6 flex flex-col gap-3 pb-4 border-b border-ts-hairline">
          {onSearch && (
            <div className="relative flex items-center w-full h-11 rounded-xl px-3.5 bg-ts-surface border border-ts-hairline shadow-sm">
              {isLoading ? (
                <Loader2 size={16} className="text-lexora-accent animate-spin shrink-0" />
              ) : (
                <Search size={16} className="text-ts-muted shrink-0" />
              )}
              <input 
                type="text" 
                placeholder="搜索或输入术语 (DeepSeek 实时生成)..." 
                className="flex-1 bg-transparent border-none outline-none ml-2 text-ts-ink placeholder:text-ts-muted text-xs font-sans"
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && mobileQuery.trim() && !isLoading) {
                    onSearch(mobileQuery.trim());
                    setMobileQuery('');
                  }
                }}
                disabled={isLoading}
              />
              {mobileQuery && !isLoading && (
                <button onClick={() => setMobileQuery('')} className="p-1 text-ts-muted">
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Recent Search Pills Carousel */}
          {recentSearches && recentSearches.length > 0 && onSelectConcept && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
              {recentSearches.map((item) => {
                const isActive = item.id === activeConceptId;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectConcept(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs shrink-0 transition-all border ${
                      isActive
                        ? 'bg-ts-ink text-ts-canvas border-ts-ink font-semibold shadow-sm'
                        : 'bg-ts-surface text-ts-muted border-ts-hairline hover:text-ts-ink'
                    }`}
                  >
                    {item.english}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Overline */}
        <div className="text-lexora-accent font-display uppercase tracking-[0.1em] font-semibold text-[11px] sm:text-[12px] mb-3 sm:mb-[24px]">
          {concept.domain}
        </div>

        {/* Title Group */}
        <h1 className="font-display font-bold text-3xl sm:text-5xl xl:text-[64px] leading-[1.15] text-ts-ink mb-2 sm:mb-[18px] break-words">
          {concept.english}
        </h1>
        <h2 className="text-xl sm:text-[36px] leading-tight sm:leading-[44px] font-medium text-ts-ink mb-3 sm:mb-[24px]">
          {concept.chinese}
        </h2>

        {/* Pronunciation & Mobile Mastery Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-[32px]">
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePlayPronunciation}
              title="点击朗读英文发音"
              className={`w-[36px] h-[36px] rounded-full shadow-sm hover:shadow-md bg-ts-surface flex items-center justify-center transition-all ${
                isPlayingAudio ? 'text-lexora-accent ring-2 ring-lexora-accent/30 animate-pulse' : 'text-ts-muted hover:text-ts-ink hover:bg-ts-surface-elevated'
              }`}
            >
              <Volume2 size={16} className={isPlayingAudio ? 'scale-110' : ''} />
            </button>
            <span className="text-[13px] text-ts-muted font-barlow tracking-wide">
              {concept.pronunciation}
            </span>
          </div>

          {/* Mobile Mastery Control Buttons (< lg) */}
          {onUpdateLearningState && (
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => onUpdateLearningState(concept.id, isReviewing ? 'learning' : 'review')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isReviewing
                    ? 'bg-ts-warning/20 text-ts-warning'
                    : 'bg-ts-surface border border-ts-hairline text-ts-ink hover:bg-ts-surface-elevated'
                }`}
              >
                <Clock size={13} />
                <span>{isReviewing ? '已在复习中' : '加入复习'}</span>
              </button>
              <button
                onClick={() => onUpdateLearningState(concept.id, isMastered ? 'learning' : 'mastered')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isMastered
                    ? 'bg-ts-success text-white shadow-sm'
                    : 'bg-ts-ink text-ts-canvas hover:opacity-90'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>{isMastered ? '已掌握' : '标记掌握'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Reading Mode Control */}
        <div className="flex items-center gap-4 border-b border-ts-hairline-soft mb-6 sm:mb-[32px]">
          <button 
            onClick={() => setReadingMode('simple')}
            className={`pb-3 text-[14px] sm:text-[15px] font-medium transition-colors border-b-2 ${readingMode === 'simple' ? 'text-ts-ink border-lexora-accent font-semibold' : 'text-ts-muted hover:text-ts-ink border-transparent'}`}
          >
            简单
          </button>
          <button 
            onClick={() => setReadingMode('deep')}
            className={`pb-3 text-[14px] sm:text-[15px] font-medium transition-colors border-b-2 ${readingMode === 'deep' ? 'text-ts-ink border-lexora-accent font-semibold' : 'text-ts-muted hover:text-ts-ink border-transparent'}`}
          >
            深入
          </button>
          <button 
            onClick={() => setReadingMode('tutor')}
            className={`pb-3 text-[14px] sm:text-[15px] font-medium transition-colors border-b-2 flex items-center gap-1.5 ${readingMode === 'tutor' ? 'text-lexora-accent border-lexora-accent font-semibold' : 'text-ts-muted hover:text-ts-ink border-transparent'}`}
          >
            <Sparkles size={14} />
            AI 导师
          </button>
        </div>

        {/* Concept Content */}
        {readingMode === 'simple' && (
          <div className="text-[14.5px] sm:text-[15.3px] leading-relaxed sm:leading-[28px] text-lexora-body bg-ts-surface p-5 sm:p-6 rounded-[12px] shadow-sm border border-ts-hairline-soft">
            <div className="font-semibold text-ts-ink mb-2 text-[15px] sm:text-[16px]">一句话总结 / 核心定义</div>
            <p className="text-ts-ink/90">{concept.conciseDefinition}</p>
          </div>
        )}

        {readingMode === 'deep' && (
          <div className="prose prose-ts dark:prose-invert max-w-none text-[14.5px] sm:text-[15.3px] leading-relaxed text-lexora-body">
            <div className="text-[15px] sm:text-[16px] font-semibold text-ts-ink mb-4 p-4 rounded-lg bg-lexora-accent-soft/30">
              {concept.conciseDefinition}
            </div>
            {concept.deepExplanation?.map((paragraph, idx) => (
              <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
            ))}
          </div>
        )}

        {readingMode === 'tutor' && (
          <AITutor key={concept.id} concept={concept} />
        )}

        {/* Mobile Upstream / Downstream Relations Graph (< lg) */}
        {concept.relations && concept.relations.length > 0 && (
          <div className="lg:hidden mt-10 pt-6 border-t border-ts-hairline">
            <div className="flex items-center gap-2 mb-3.5">
              <Network size={16} className="text-ts-muted" />
              <h4 className="text-xs font-bold text-ts-ink uppercase tracking-wider">上下游关联概念</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {concept.relations.map((rel) => {
                const isCurrent = rel.type === 'current';
                return (
                  <div
                    key={rel.id}
                    onClick={() => !isCurrent && onSelectRelation && onSelectRelation(rel.english)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'border-lexora-accent/40 bg-lexora-accent-soft/20 cursor-default'
                        : 'border-ts-hairline bg-ts-surface hover:border-lexora-accent/60 cursor-pointer shadow-xs'
                    }`}
                  >
                    <div className="text-[10px] font-medium text-ts-muted mb-0.5">
                      {rel.type === 'prerequisite' ? '上游概念 (Prerequisite)' : rel.type === 'derived' ? '衍生概念 (Derived)' : rel.type === 'analogy' ? '类比概念 (Analogy)' : '当前概念'}
                    </div>
                    <div className="text-xs font-bold text-ts-ink">{rel.english}</div>
                    <div className="text-[11px] text-ts-body mt-0.5">{rel.chinese}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
