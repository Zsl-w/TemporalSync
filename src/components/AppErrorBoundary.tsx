import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('Application render failed:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-ts-canvas px-6 flex items-center justify-center text-center">
        <div className="max-w-md rounded-2xl border border-ts-hairline bg-ts-surface p-8 shadow-xl">
          <AlertTriangle size={28} className="mx-auto text-ts-warning" />
          <h1 className="mt-4 text-2xl font-bold text-ts-ink">TemporalSync needs a refresh</h1>
          <p className="mt-2 text-sm leading-relaxed text-ts-body">
            页面加载失败。请刷新后重试；你的本地设置不会被清除。
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 min-h-11 inline-flex items-center gap-2 rounded-xl bg-ts-primary px-5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary"
          >
            <RefreshCw size={16} />
            Reload page
          </button>
        </div>
      </main>
    );
  }
}
