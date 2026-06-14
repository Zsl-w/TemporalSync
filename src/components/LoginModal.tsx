import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Laptop, HelpCircle, Loader2, Sparkles, User, Mail, ShieldAlert, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginTab = 'email' | 'anonymous' | 'mock';

const tabs: { id: LoginTab; label: string; icon: React.ReactNode }[] = [
  { id: 'email', label: '管理员', icon: <Mail size={14} /> },
  { id: 'anonymous', label: '游客', icon: <Sparkles size={14} /> },
  { id: 'mock', label: '测试', icon: <Laptop size={14} /> },
];

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAnonymously, loginWithEmail, verifyEmailAndLogin, loginAsMock } = useAuth();
  const [activeTab, setActiveTab] = useState<LoginTab>('email');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Verification state
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Mock inputs
  const [mockName, setMockName] = useState('');
  const [mockEmail, setMockEmail] = useState('');
  const [mockRole, setMockRole] = useState('Developer');

  const resetForm = () => {
    setErrorMsg(null);
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setNeedsVerification(false);
    setVerificationCode('');
  };

  // --- Admin email login ---
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('请输入邮箱和密码。');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('密码长度至少为 6 位。');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await loginWithEmail(email.trim(), password);
      if (result && 'needsVerification' in result && result.needsVerification) {
        // Account registered, need email verification
        setNeedsVerification(true);
        setErrorMsg(null);
      } else {
        resetForm();
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      if (msg.includes('not registered') || msg.includes('not found')) {
        setErrorMsg('该邮箱尚未注册，请联系管理员。');
      } else if (msg.includes('wrong password') || msg.includes('invalid')) {
        setErrorMsg('邮箱或密码错误，请重试。');
      } else {
        setErrorMsg(msg || '管理员登录失败，请重试。');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Email verification ---
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setErrorMsg('请输入邮箱验证码。');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await verifyEmailAndLogin(email.trim(), verificationCode.trim(), password);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '验证失败，请检查验证码是否正确。');
    } finally {
      setLoading(false);
    }
  };

  // --- Anonymous login ---
  const handleAnonymousLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginAnonymously();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '匿名登录失败，请确认已在 CloudBase 控制台启用匿名登录。');
    } finally {
      setLoading(false);
    }
  };

  // --- Mock login ---
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
              <div className="w-[2.5px] h-[60%] bg-[#143559] rounded-full" />
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
        <div className="grid grid-cols-3 border-b border-ts-hairline dark:border-ts-navy-800 text-[10px] font-bold uppercase tracking-wider bg-ts-canvas/40">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); resetForm(); }}
              className={cn(
                "py-2.5 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer",
                activeTab === tab.id
                  ? "border-ts-primary text-ts-primary bg-ts-surface"
                  : "border-transparent text-ts-muted hover:text-ts-ink hover:bg-ts-surface-elevated/30"
              )}
            >
              {tab.icon}
              <span className="text-[9px]">{tab.label}</span>
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

          {/* --- Email Tab --- */}
          {activeTab === 'email' && !needsVerification && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 py-2">
              <div className="text-center space-y-1 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mx-auto shadow-inner mb-2">
                  <Mail size={22} />
                </div>
                <h3 className="text-sm font-bold text-ts-ink dark:text-white">
                  管理员登录
                </h3>
                <p className="text-[11px] text-ts-muted leading-relaxed">
                  仅管理员可登录，用于发布博客和管理内容。
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-ts-muted uppercase tracking-wider">邮箱地址</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ts-muted">
                    <Mail size={14} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-ts-surface text-ts-ink border border-ts-hairline pl-10 pr-4 h-11 rounded-[6px] text-xs font-medium focus:border-ts-primary outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-ts-muted uppercase tracking-wider">密码</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ts-muted">
                    <Lock size={14} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-ts-surface text-ts-ink border border-ts-hairline pl-10 pr-10 h-11 rounded-[6px] text-xs font-medium focus:border-ts-primary outline-none transition-all"
                    placeholder="至少 6 位密码"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ts-muted hover:text-ts-ink cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-12 bg-blue-600 text-white rounded-[8px] text-xs font-bold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span>管理员登录</span>
                )}
              </button>
            </form>
          )}

          {/* --- Verification Code Step --- */}
          {activeTab === 'email' && needsVerification && (
            <form onSubmit={handleVerifySubmit} className="space-y-4 py-2">
              <div className="text-center space-y-1 mb-2">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 mx-auto shadow-inner mb-2">
                  <ShieldAlert size={22} />
                </div>
                <h3 className="text-sm font-bold text-ts-ink dark:text-white">
                  验证邮箱
                </h3>
                <p className="text-[11px] text-ts-muted leading-relaxed">
                  验证码已发送至 <strong>{email}</strong>，请查收邮箱并输入 6 位验证码。
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-ts-muted uppercase tracking-wider">验证码</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ts-muted">
                    <ShieldAlert size={14} />
                  </div>
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-ts-surface text-ts-ink border border-ts-hairline pl-10 pr-4 h-11 rounded-[6px] text-xs font-medium focus:border-ts-primary outline-none transition-all tracking-[0.3em] text-center"
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length < 6}
                className="w-full flex items-center justify-center gap-2 h-12 bg-green-600 text-white rounded-[8px] text-xs font-bold hover:bg-green-700 transition-all shadow-md disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span>验证并登录</span>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setNeedsVerification(false); setErrorMsg(null); }}
                  className="text-[11px] text-ts-muted hover:text-ts-ink font-semibold cursor-pointer bg-transparent border-none p-0"
                >
                  返回重新登录
                </button>
              </div>
            </form>
          )}

          {/* --- Anonymous Tab --- */}
          {activeTab === 'anonymous' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-ts-navy-800/10 flex items-center justify-center text-ts-navy-800 mx-auto shadow-inner mb-4">
                <Sparkles size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ts-ink dark:text-white">免授权访客模式</h3>
                <p className="text-[11px] text-ts-muted leading-relaxed max-w-[280px] mx-auto">
                  使用 CloudBase 匿名会话安全连接后端数据库。可以浏览内容，但切换浏览器后状态会重置。
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

          {/* --- Mock Tab --- */}
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
                ℹ️ <strong>本地沙盒预览</strong>：所有操作都会自动保存在本地 localStorage，无需后端数据库支持，保障离线环境下 100% 完美运行。
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
