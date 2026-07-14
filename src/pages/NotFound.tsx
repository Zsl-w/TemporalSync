import { ArrowLeft, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export const NotFound = () => {
  const { language } = useSettings();

  return (
    <section className="min-h-[calc(100vh-4rem)] px-6 flex items-center justify-center text-center bg-ts-canvas">
      <div className="max-w-xl">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-ts-primary">404 · TemporalSync</p>
        <h1 className="mt-5 text-4xl md:text-6xl font-bold text-ts-ink">
          {language === 'zh' ? '这一刻尚未被记录。' : 'This moment is not in the timeline.'}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ts-body">
          {language === 'zh' ? '地址可能已经变化。返回首页，或直接进入创作工具。' : 'The address may have changed. Return home or open the creative tools.'}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/" className="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-ts-primary px-6 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary">
            <ArrowLeft size={16} />
            {language === 'zh' ? '返回首页' : 'Back home'}
          </Link>
          <Link to="/work" className="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-ts-hairline bg-ts-surface px-6 text-sm font-bold text-ts-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary">
            <Wrench size={16} />
            {language === 'zh' ? '打开工具' : 'Open tools'}
          </Link>
        </div>
      </div>
    </section>
  );
};
