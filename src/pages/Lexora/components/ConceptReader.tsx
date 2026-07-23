import React, { useState } from 'react';
import { Volume2, Loader2, Sparkles } from 'lucide-react';
import { Concept } from '../types';
import { AITutor } from './AITutor';

interface ConceptReaderProps {
  concept: Concept;
  isLoading?: boolean;
}

export const ConceptReader: React.FC<ConceptReaderProps> = ({ concept, isLoading }) => {
  const [readingMode, setReadingMode] = useState<'simple' | 'deep' | 'tutor'>('simple');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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
      
      // Specifically filter for high-quality native English voices
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
      <div className="flex-1 flex flex-col min-w-[640px] px-[46px] py-[42px] 2xl:px-[56px] overflow-y-auto relative bg-ts-canvas">
        <div className="max-w-[760px] mx-auto w-full flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={36} className="animate-spin text-lexora-accent" />
          <span className="text-sm font-medium text-ts-muted tracking-wider">DeepSeek 正在生成专业概念解析...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-[640px] px-[46px] py-[42px] 2xl:px-[56px] overflow-y-auto relative bg-ts-canvas">
      <div className="max-w-[760px] mx-auto w-full">
        {/* Category Overline */}
        <div className="text-lexora-accent font-display uppercase tracking-[0.1em] font-semibold text-[12px] mb-[24px]">
          {concept.domain}
        </div>

        {/* Title Group */}
        <h1 className="font-display font-bold text-[54px] xl:text-[64px] leading-[1.1] text-ts-ink mb-[18px]">
          {concept.english}
        </h1>
        <h2 className="text-[36px] leading-[44px] font-medium text-ts-ink mb-[24px]">
          {concept.chinese}
        </h2>

        {/* Pronunciation */}
        <div className="flex items-center gap-3 mb-[32px]">
          <button 
            onClick={handlePlayPronunciation}
            title="点击朗读英文发音"
            className={`w-[36px] h-[36px] rounded-full shadow-sm hover:shadow-md bg-ts-surface flex items-center justify-center transition-all ${
              isPlayingAudio ? 'text-lexora-accent ring-2 ring-lexora-accent/30 animate-pulse' : 'text-ts-muted hover:text-ts-ink hover:bg-ts-surface-elevated'
            }`}
          >
            <Volume2 size={16} className={isPlayingAudio ? 'scale-110' : ''} />
          </button>
          <span className="text-[13px] text-ts-muted font-mono tracking-wide">
            {concept.pronunciation}
          </span>
        </div>

        {/* Reading Mode Control */}
        <div className="flex items-center gap-4 border-b border-ts-hairline-soft mb-[32px]">
          <button 
            onClick={() => setReadingMode('simple')}
            className={`pb-3 text-[15px] font-medium transition-colors border-b-2 ${readingMode === 'simple' ? 'text-ts-ink border-lexora-accent' : 'text-ts-muted hover:text-ts-ink border-transparent'}`}
          >
            简单
          </button>
          <button 
            onClick={() => setReadingMode('deep')}
            className={`pb-3 text-[15px] font-medium transition-colors border-b-2 ${readingMode === 'deep' ? 'text-ts-ink border-lexora-accent' : 'text-ts-muted hover:text-ts-ink border-transparent'}`}
          >
            深入
          </button>
          <button 
            onClick={() => setReadingMode('tutor')}
            className={`pb-3 text-[15px] font-medium transition-colors border-b-2 flex items-center gap-1.5 ${readingMode === 'tutor' ? 'text-lexora-accent border-lexora-accent font-semibold' : 'text-ts-muted hover:text-ts-ink border-transparent'}`}
          >
            <Sparkles size={14} />
            AI 导师
          </button>
        </div>

        {/* Concept Content */}
        {readingMode === 'simple' && (
          <div className="text-[15.3px] leading-[28px] text-lexora-body bg-ts-surface p-6 rounded-[12px] shadow-sm border border-ts-hairline-soft">
            <div className="font-semibold text-ts-ink mb-2 text-[16px]">一句话总结 / 核心定义</div>
            <p className="text-ts-ink/90">{concept.conciseDefinition}</p>
          </div>
        )}

        {readingMode === 'deep' && (
          <div className="prose prose-ts dark:prose-invert max-w-none text-[15.3px] leading-[26px] text-lexora-body">
            <div className="text-[16px] font-semibold text-ts-ink mb-4 p-4 rounded-lg bg-lexora-accent-soft/30">
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
      </div>
    </div>
  );
};
