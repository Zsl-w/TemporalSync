import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, Laptop, HelpCircle, Loader2, Sparkles, User, Mail, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginAnonymously, loginAsMock } = useAuth();
  const [activeTab, setActiveTab] = useState<'standard' | 'anonymous' | 'mock'>('standard');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock inputs
  const [mockName, setMockName] = useState('');
  const [mockEmail, setMockEmail] = useState('');
  const [mockRole, setMockRole] = useState('Developer');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('登录失败：此域名尚未在 Firebase 控制台的“授权网域”（Authorized Domains）中注册。请使用下面的匿名登录或开发者测试模式。');
      } else {
        setErrorMsg(err.message || 'Google 登录发生未知错误，请重试。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginAnonymously();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '匿名登录失败，可能是 Firebase 未开启匿名登录提供商，请使用开发者测试模式。');
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      loginAsMock(mockName.trim() || '测试用户', mockEmail.trim() || 'test@temporalsync.online', mockRole);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '模拟登录失败。');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ts-navy-950/60 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-ts-surface/90 border border-ts-hairline dark:border-ts-navy-700/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ts-hairline dark:border-ts-navy-800 bg-ts-surface-elevated/40">
          <div className="flex items-center gap-2.5">
            <div className="flex items-end gap-[2px] h-5">
              <div className="w-[2.5px] h-full bg-ts-primary rounded-full" />
              <div className="w-[2.5px] h-[60%] bg-ts-navy-800 rounded-full" />
            </div>
            <h2 className="font-display font-bold text-base text-ts-ink dark:text-white">时间同步 - 选择登录方式</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full flex items-center justify-center text-ts-muted hover:text-ts-ink hover:bg-ts-surface-elevated transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 border-b border-ts-hairline dark:border-ts-navy-800 text-[11px] font-bold uppercase tracking-wider bg-ts-canvas/40">
          {[
            { id: 'standard', label: 'Google' },
            { id: 'anonymous', label: '游客登录' },
            { id: 'mock', label: '测试模式' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setErrorMsg(null); }}
              className={cn(
                "py-3 text-center border-b-2 transition-all cursor-pointer",
                activeTab === tab.id 
                  ? "border-ts-primary text-ts-primary bg-ts-surface" 
                  : "border-transparent text-ts-muted hover:text-ts-ink hover:bg-ts-surface-elevated/30"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="flex gap-2.5 p-4 rounded-xl bg-ts-error-bg border border-ts-error/15 text-ts-error text-xs leading-relaxed font-medium animate-shake">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'standard' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-ts-primary/10 flex items-center justify-center text-ts-primary mx-auto shadow-inner mb-4">
                <LogIn size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ts-ink dark:text-white">推荐的生产环境登录</h3>
                <p className="text-[11px] text-ts-muted leading-relaxed max-w-[280px] mx-auto">
                  使用您的 Google 账户连接，支持跨设备同步个人数据、配置云端博客文章等。
                </p>
              </div>
              
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 h-12 bg-ts-primary text-white rounded-[8px] text-xs font-bold hover:bg-ts-primary-hover transition-all shadow-md disabled:opacity-50 mt-4 cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.822-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.11.618 4.237 1.63l3.056-3.056C19.284 2.507 15.93 1 12.24 1 5.626 1 .24 6.386.24 13s5.386 12 12 12c6.237 0 11.237-4.478 11.237-11.237 0-.785-.084-1.54-.24-2.285l-11-.193z"/>
                    </svg>
                    <span>通过 Google 登录</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 justify-center text-[10px] text-ts-muted font-medium pt-4">
                <HelpCircle size={12} />
                <span>在自定义域名部署时，需在 Firebase 授权本域名。</span>
              </div>
            </div>
          )}

          {activeTab === 'anonymous' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-ts-navy-800/10 flex items-center justify-center text-ts-navy-800 mx-auto shadow-inner mb-4">
                <Sparkles size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ts-ink dark:text-white">免授权的 Firebase 访客模式</h3>
                <p className="text-[11px] text-ts-muted leading-relaxed max-w-[280px] mx-auto">
                  使用 Firebase 匿名会话安全地连接后端数据库，无需授权当前网站域名。可以读写数据，但切换浏览器后状态会重置。
                </p>
              </div>

              <button
                onClick={handleAnonymousLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-12 bg-ts-navy-800 text-white rounded-[8px] text-xs font-bold hover:bg-ts-navy-900 transition-all shadow-md disabled:opacity-50 mt-4 cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>以游客身份快速登录</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'mock' && (
            <form onSubmit={handleMockLogin} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-ts-muted uppercase tracking-wider">测试昵称</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ts-muted">
                    <User size={14} />
                  </div>
                  <input
                    type="text"
                    required
                    value={mockName}
                    onChange={(e) => setMockName(e.target.value)}
                    className="w-full bg-ts-surface text-ts-ink border border-ts-hairline pl-10 pr-4 h-11 rounded-[6px] text-xs font-medium focus:border-ts-primary outline-none transition-all"
                    placeholder="例如: 智能医学探索者"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-ts-muted uppercase tracking-wider">测试邮箱</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ts-muted">
                    <Mail size={14} />
                  </div>
                  <input
                    type="email"
                    required
                    value={mockEmail}
                    onChange={(e) => setMockEmail(e.target.value)}
                    className="w-full bg-ts-surface text-ts-ink border border-ts-hairline pl-10 pr-4 h-11 rounded-[6px] text-xs font-medium focus:border-ts-primary outline-none transition-all"
                    placeholder="例如: explorer@temporalsync.online"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-ts-muted uppercase tracking-wider">用户角色</label>
                <select
                  value={mockRole}
                  onChange={(e) => setMockRole(e.target.value)}
                  className="w-full bg-ts-surface text-ts-ink border border-ts-hairline px-3 h-11 rounded-[6px] text-xs font-medium focus:border-ts-primary outline-none transition-all"
                >
                  <option value="Developer">系统开发者 (Developer)</option>
                  <option value="Researcher">医学研究员 (Researcher)</option>
                  <option value="Physician">智能医生 (Physician)</option>
                  <option value="Guest">普通访客 (Guest)</option>
                </select>
              </div>

              <div className="p-3 bg-ts-neutral-50 rounded-xl border border-ts-hairline text-[10px] text-ts-muted leading-relaxed">
                ℹ️ **本地沙盒预览**：所有操作（包括撰写博客等）都会自动镜像保存在本地 `localStorage`，无需 Firebase 数据库支持，保障任何网络下 100% 完美运行。
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 h-12 bg-ts-primary text-white rounded-[8px] text-xs font-bold hover:bg-ts-primary-hover transition-all shadow-md mt-4 cursor-pointer"
              >
                <Laptop size={16} />
                <span>进入本地测试模式</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
