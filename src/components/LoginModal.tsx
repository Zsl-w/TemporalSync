import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, Laptop, HelpCircle, Loader2, Sparkles, User, Mail, ShieldAlert, Lock, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginTab = 'google' | 'wechat' | 'email' | 'anonymous' | 'mock';

const tabs: { id: LoginTab; label: string; icon: React.ReactNode }[] = [
  { id: 'google', label: 'Google', icon: <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.822-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.11.618 4.237 1.63l3.056-3.056C19.284 2.507 15.93 1 12.24 1 5.626 1 .24 6.386.24 13s5.386 12 12 12c6.237 0 11.237-4.478 11.237-11.237 0-.785-.084-1.54-.24-2.285l-11-.193z"/></svg> },
  { id: 'wechat', label: '微信', icon: <MessageCircle size={14} /> },
  { id: 'email', label: '邮箱', icon: <Mail size={14} /> },
  { id: 'anonymous', label: '游客', icon: <Sparkles size={14} /> },
  { id: 'mock', label: '测试', icon: <Laptop size={14} /> },
];

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginAnonymously, loginWithEmail, signUpWithEmailPassword, loginAsMock } = useAuth();
  const [activeTab, setActiveTab] = useState<LoginTab>('google');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Email form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Mock inputs
  const [mockName, setMockName] = useState('');
  const [mockEmail, setMockEmail] = useState('');
  const [mockRole, setMockRole] = useState('Developer');

  const resetForm = () => {
    setErrorMsg(null);
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setIsSignUp(false);
  };

  // --- Google login ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google 登录失败，请重试。请确认已在 CloudBase 控制台启用 Google 登录。');
    } finally {
      setLoading(false);
    }
  };

  // --- WeChat login (via CloudBase OAuth redirect) ---
  const handleWechatLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // CloudBase supports WeChat OAuth on web.
      // This will redirect to WeChat for authorization and back.
      const { auth } = await import('../lib/cloudbase');
      await auth.signInWithRedirect({ provider: 'weixin' });
      // After redirect back, AuthContext's onLoginStateChanged will pick up the user
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '微信登录失败，请确认已在 CloudBase 控制台启用微信登录。');
      setLoading(false);
    }
  };

  // --- Email login / sign up ---
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
      if (isSignUp) {
        await signUpWithEmailPassword(email.trim(), password);
      } else {
        await loginWithEmail(email.trim(), password);
      }
      resetForm();
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      if (msg.includes('not registered') || msg.includes('not found')) {
        setErrorMsg('该邮箱尚未注册，请先注册账号。');
      } else if (msg.includes('wrong password') || msg.includes('invalid')) {
        setErrorMsg('邮箱或密码错误，请重试。');
      } else if (msg.includes('already exists') || msg.includes('already registered')) {
        setErrorMsg('该邮箱已注册，请直接登录。');
      } else {
        setErrorMsg(msg || '邮箱登录失败，请重试。');
      }
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
        <div className="grid grid-cols-5 border-b border-ts-hairline dark:border-ts-navy-800 text-[10px] font-bold uppercase tracking-wider bg-ts-canvas/40">
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

          {/* --- Google Tab --- */}
          {activeTab === 'google' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-ts-primary/10 flex items-center justify-center text-ts-primary mx-auto shadow-inner mb-4">
                <LogIn size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ts-ink dark:text-white">Google 账号登录</h3>
                <p className="text-[11px] text-ts-muted leading-relaxed max-w-[280px] mx-auto">
                  使用您的 Google 账户连接，支持跨设备同步个人数据与云端博客。
                </p>
              </div>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 h-12 bg-white text-gray-700 border border-gray-300 rounded-[8px] text-xs font-bold hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 mt-4 cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>通过 Google 登录</span>
                  </>
                )}
              </button>
              <div className="flex items-center gap-2 justify-center text-[10px] text-ts-muted font-medium pt-4">
                <HelpCircle size={12} />
                <span>需在 CloudBase 控制台启用 Google 登录方式。</span>
              </div>
            </div>
          )}

          {/* --- WeChat Tab --- */}
          {activeTab === 'wechat' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 mx-auto shadow-inner mb-4">
                <MessageCircle size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-ts-ink dark:text-white">微信扫码登录</h3>
                <p className="text-[11px] text-ts-muted leading-relaxed max-w-[280px] mx-auto">
                  使用微信账号快速登录，需在 CloudBase 控制台配置微信公众号/小程序 AppID。
                </p>
              </div>
              <button
                onClick={handleWechatLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 h-12 bg-[#07C160] text-white rounded-[8px] text-xs font-bold hover:bg-[#06AD56] transition-all shadow-md disabled:opacity-50 mt-4 cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <MessageCircle size={16} />
                    <span>微信扫码登录</span>
                  </>
                )}
              </button>
              <div className="flex items-center gap-2 justify-center text-[10px] text-ts-muted font-medium pt-4">
                <HelpCircle size={12} />
                <span>需在 CloudBase 控制台配置微信开放平台/公众号。</span>
              </div>
            </div>
          )}

          {/* --- Email Tab --- */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 py-2">
              <div className="text-center space-y-1 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mx-auto shadow-inner mb-2">
                  <Mail size={22} />
                </div>
                <h3 className="text-sm font-bold text-ts-ink dark:text-white">
                  {isSignUp ? '注册新账号' : '邮箱密码登录'}
                </h3>
                <p className="text-[11px] text-ts-muted leading-relaxed">
                  {isSignUp ? '使用邮箱注册 CloudBase 账号。' : '使用已注册的邮箱和密码登录。'}
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
                  <span>{isSignUp ? '注册并登录' : '登录'}</span>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }}
                  className="text-[11px] text-ts-primary hover:text-ts-primary-hover font-semibold cursor-pointer bg-transparent border-none p-0"
                >
                  {isSignUp ? '已有账号？直接登录' : '没有账号？注册新账号'}
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
