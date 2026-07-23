import React, { useState } from 'react';
import { Search, X, ChevronDown, Loader2, Trash2 } from 'lucide-react';

interface SearchRailProps {
  recentSearches: { id: string; english: string; chinese: string; time: string }[];
  activeConceptId: string;
  onSelectConcept: (id: string) => void;
  onSearch: (query: string) => void;
  onDeleteConcept?: (id: string) => void;
  isLoading: boolean;
}

export const SearchRail: React.FC<SearchRailProps> = ({
  recentSearches,
  activeConceptId,
  onSelectConcept,
  onSearch,
  onDeleteConcept,
  isLoading,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="hidden md:flex flex-col w-[320px] 2xl:w-[340px] flex-shrink-0 p-[36px] overflow-y-auto">
      <h3 className="font-display font-semibold text-[24px] mb-[24px] text-ts-ink">概念搜索</h3>
      
      {/* Search Input */}
      <div className="relative mb-[36px]">
        <div 
          className={`flex items-center w-full h-[52px] rounded-[8px] px-[14px] transition-all bg-ts-surface ${
            isFocused ? 'ring-2 ring-lexora-accent/20 shadow-md' : 'shadow-sm hover:shadow-md'
          }`}
        >
          {isLoading ? (
            <Loader2 size={18} className="text-lexora-accent animate-spin flex-shrink-0" />
          ) : (
            <Search size={18} className="text-ts-muted flex-shrink-0" />
          )}
          <input 
            type="text" 
            placeholder="输入术语，回车使用 DeepSeek 解释..."
            className="flex-1 bg-transparent border-none outline-none ml-[10px] text-ts-ink placeholder:text-ts-muted text-[14px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
          />
          {query && !isLoading && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-ts-surface-elevated rounded-md transition-colors"
            >
              <X size={16} className="text-ts-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Domain Filter */}
      <div className="mb-[36px]">
        <button className="flex items-center justify-between w-full text-[13px] text-ts-muted hover:text-ts-ink transition-colors group">
          <span className="font-medium tracking-wide">筛选领域</span>
          <ChevronDown size={14} className="group-hover:text-ts-ink transition-colors" />
        </button>
      </div>

      {/* Recent Concepts */}
      <div>
        <h4 className="text-[13px] font-semibold text-ts-muted mb-2 tracking-[0.02em]">最近概念</h4>
        <div className="flex flex-col gap-1 -mx-4">
          {recentSearches.map((concept) => (
            <div
              key={concept.id}
              onClick={() => onSelectConcept(concept.id)}
              className={`flex flex-col items-start px-4 py-3 rounded-none text-left transition-colors cursor-pointer group relative ${
                concept.id === activeConceptId 
                  ? 'bg-lexora-accent-soft border-l-[3px] border-lexora-accent' 
                  : 'border-l-[3px] border-transparent hover:bg-ts-surface-elevated'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-display font-medium text-[15px] text-ts-ink">{concept.english}</span>
                {onDeleteConcept && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConcept(concept.id);
                    }}
                    title="删除概念"
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-ts-error text-ts-muted transition-all rounded hover:bg-ts-surface"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[13px] text-ts-body">{concept.chinese}</span>
                <span className="text-[12px] text-ts-muted-soft tracking-wider scale-90 origin-left">•</span>
                <span className="text-[12px] text-ts-muted">{concept.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
