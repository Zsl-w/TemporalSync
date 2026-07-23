import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Bot, User, HelpCircle } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Concept } from '../types';
import { askLexoraTutor } from '../../../services/lexoraService';

interface AITutorProps {
  concept: Concept;
}

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
}

const PRESET_PROMPTS = [
  '💡 用大白话举个例子',
  '🔬 在实际科研/工程中的应用',
  '❓ 出两道测验题考考我',
];

export const AITutor: React.FC<AITutorProps> = ({ concept }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const renderMarkdown = (content: string) => {
    const parsed = marked.parse(content, { async: false }) as string;
    return { __html: DOMPurify.sanitize(parsed) };
  };

  const handleSend = async (questionText?: string) => {
    const query = questionText || input.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages(prev => [...prev, userMsg]);
    if (!questionText) setInput('');
    setIsLoading(true);

    try {
      const answerText = await askLexoraTutor(concept, query);
      const tutorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: answerText,
      };
      setMessages(prev => [...prev, tutorMsg]);
    } catch (err: unknown) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: err instanceof Error ? `解答遇到问题：${err.message}` : '解答发生未知错误',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-lexora-accent/20 flex items-center justify-center text-lexora-accent">
          <Sparkles size={16} />
        </div>
        <h3 className="font-display font-semibold text-[18px] text-ts-ink">AI 导师随身问答</h3>
        <span className="text-[12px] text-ts-muted">随时针对“{concept.english}”发起追问</span>
      </div>

      {/* Preset Prompt Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESET_PROMPTS.map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(promptText)}
            disabled={isLoading}
            className="text-[13px] px-3.5 py-1.5 rounded-full bg-ts-surface hover:bg-ts-surface-elevated text-ts-ink shadow-sm hover:shadow-md transition-all border border-ts-hairline-soft disabled:opacity-50"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Message History */}
      {messages.length > 0 && (
        <div className="flex flex-col gap-4 mb-6 max-h-[420px] overflow-y-auto pr-2">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 text-[14px] leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'tutor' && (
                <div className="w-7 h-7 rounded-full bg-lexora-accent/10 flex items-center justify-center text-lexora-accent flex-shrink-0 mt-0.5">
                  <Bot size={15} />
                </div>
              )}
              {msg.sender === 'user' ? (
                <div className="max-w-[85%] p-4 rounded-[12px] whitespace-pre-wrap bg-lexora-accent text-white shadow-sm">
                  {msg.text}
                </div>
              ) : (
                <div
                  className="max-w-[85%] p-4 rounded-[12px] bg-ts-surface text-ts-ink shadow-sm border border-ts-hairline-soft prose prose-ts dark:prose-invert text-[14px] leading-relaxed"
                  dangerouslySetInnerHTML={renderMarkdown(msg.text)}
                />
              )}
              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-ts-surface-elevated flex items-center justify-center text-ts-muted flex-shrink-0 mt-0.5">
                  <User size={15} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-3 text-ts-muted text-sm py-2">
              <Loader2 size={16} className="animate-spin text-lexora-accent" />
              <span>AI Tutor 正在思考解答...</span>
            </div>
          )}
        </div>
      )}

      {/* Custom Question Input */}
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder={`针对 ${concept.english} 提问...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          className="w-full h-[46px] pl-4 pr-12 rounded-[8px] bg-ts-surface text-ts-ink placeholder:text-ts-muted text-[14px] shadow-sm hover:shadow-md focus:shadow-md focus:ring-2 focus:ring-lexora-accent/20 outline-none transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="absolute right-2 p-2 text-lexora-accent hover:text-lexora-accent-hover disabled:opacity-30 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
