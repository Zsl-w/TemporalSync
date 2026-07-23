import React from 'react';
import { Bookmark, Clock, Network, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Concept, LearningState } from '../types';

interface KnowledgeRailProps {
  concept: Concept;
  onUpdateLearningState: (conceptId: string, newState: LearningState) => void;
  onSelectRelation?: (englishTerm: string) => void;
}

export const KnowledgeRail: React.FC<KnowledgeRailProps> = ({ concept, onUpdateLearningState, onSelectRelation }) => {
  const renderLearningState = () => {
    switch (concept.learningState) {
      case 'mastered':
        return (
          <div className="flex items-center gap-1.5 text-ts-success">
            <CheckCircle2 size={14} />
            <span className="text-[12px] font-medium">已掌握</span>
          </div>
        );
      case 'review':
        return (
          <div className="flex items-center gap-1.5 text-ts-warning">
            <Clock size={14} />
            <span className="text-[12px] font-medium">待复习</span>
          </div>
        );
      case 'learning':
        return (
          <div className="flex items-center gap-1.5 text-lexora-accent">
            <div className="w-2 h-2 rounded-full border-[1.5px] border-current border-t-transparent animate-spin" />
            <span className="text-[12px] font-medium">学习中</span>
          </div>
        );
      case 'new':
      default:
        return (
          <div className="flex items-center gap-1.5 text-ts-muted">
            <span className="text-[12px] font-medium">尚未学习</span>
          </div>
        );
    }
  };

  const handleToggleReview = () => {
    const nextState: LearningState = concept.learningState === 'review' ? 'learning' : 'review';
    onUpdateLearningState(concept.id, nextState);
  };

  const handleToggleMastered = () => {
    const nextState: LearningState = concept.learningState === 'mastered' ? 'learning' : 'mastered';
    onUpdateLearningState(concept.id, nextState);
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'prerequisite': return '上游概念 (Prerequisite)';
      case 'current': return '当前概念 (Current)';
      case 'derived': return '衍生概念 (Derived)';
      case 'analogy': return '类比概念 (Analogy)';
      default: return type;
    }
  };

  const isReviewing = concept.learningState === 'review';
  const isMastered = concept.learningState === 'mastered';

  return (
    <div className="hidden lg:flex flex-col w-[360px] 2xl:w-[380px] flex-shrink-0 p-[32px] pt-[36px] overflow-y-auto bg-ts-canvas">
      
      {/* Learning State Action Card */}
      <div className="bg-ts-surface rounded-[12px] p-5 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] font-semibold text-ts-muted tracking-wide">学习状态</span>
          {renderLearningState()}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleToggleReview}
            className={`flex-1 h-[36px] rounded-[6px] shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 text-[13px] font-medium transition-all ${
              isReviewing 
                ? 'bg-ts-warning/15 text-ts-warning hover:bg-ts-warning/25' 
                : 'bg-ts-surface hover:bg-ts-surface-elevated text-ts-ink'
            }`}
          >
            {isReviewing ? <RotateCcw size={14} /> : <Clock size={14} />}
            <span>{isReviewing ? '已在复习中' : '加入复习'}</span>
          </button>
          <button 
            onClick={handleToggleMastered}
            className={`flex-1 h-[36px] rounded-[6px] flex items-center justify-center gap-1.5 text-[13px] font-medium transition-all ${
              isMastered 
                ? 'bg-ts-success text-white shadow-sm hover:bg-ts-success/90' 
                : 'bg-ts-ink hover:bg-ts-ink/90 text-ts-canvas shadow-sm'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>{isMastered ? '已标记掌握' : '标记掌握'}</span>
          </button>
        </div>
      </div>

      {/* Knowledge Path */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Network size={16} className="text-ts-muted" />
          <h4 className="text-[13px] font-semibold text-ts-ink tracking-[0.02em]">知识关系</h4>
        </div>
        
        <div className="flex flex-col relative before:absolute before:left-2.5 before:top-4 before:bottom-4 before:w-[1px] before:bg-ts-hairline">
          {concept.relations?.map((relation) => {
            const isCurrent = relation.type === 'current';
            return (
              <div key={relation.id} className="flex gap-4 relative py-3 group">
                <div className={`w-[5px] h-[5px] rounded-full mt-1.5 z-10 relative left-[8.5px] transition-colors ${
                  isCurrent 
                    ? 'bg-lexora-accent ring-4 ring-ts-canvas' 
                    : 'bg-ts-muted-soft group-hover:bg-lexora-accent'
                }`} />
                <div className="flex-1 ml-2">
                  <div className={`text-[11px] mb-1 ${isCurrent ? 'text-lexora-accent font-medium' : 'text-ts-muted'}`}>
                    {getTypeLabel(relation.type)}
                  </div>
                  {isCurrent ? (
                    <div className="text-[14px] font-medium text-ts-ink">
                      {relation.english}
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => onSelectRelation && onSelectRelation(relation.english)}
                        className="text-[14px] font-medium text-ts-ink hover:text-lexora-accent transition-colors text-left"
                      >
                        {relation.english}
                      </button>
                      <div className="text-[12px] text-ts-body mt-0.5">{relation.chinese}</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
