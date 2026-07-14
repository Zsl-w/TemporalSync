import { useMemo } from 'react';
import { ArrowRight, Check, Radio, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { cn } from '../lib/utils';

type Project = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  image: string;
  imageAlt: string;
  href: string;
  status: string;
  imagePosition?: string;
};

export const StudyRoom = () => {
  const { language } = useSettings();
  const reduceMotion = useReducedMotion();
  const isZh = language === 'zh';

  const copy = isZh
    ? {
        eyebrow: 'DEVELOPMENT LAB',
        title: '自习室',
        subtitle: '把内容工作流和信息处理中的真实摩擦，做成可以直接使用的小工具。',
        summary: '2 个内容工具 · 1 条实时信息流',
        explore: '打开项目',
        footerTitle: '持续把高频问题做成可靠工具',
        footerDescription: '每个项目都从一个真实使用场景开始，再用最短路径验证价值。',
      }
    : {
        eyebrow: 'DEVELOPMENT LAB',
        title: 'WORK',
        subtitle: 'Small, usable tools built around real friction in content and information workflows.',
        summary: '2 content tools · 1 live information stream',
        explore: 'Open project',
        footerTitle: 'Turning repeated friction into reliable tools',
        footerDescription: 'Every project starts with a real workflow and takes the shortest path to useful.',
      };

  const projects = useMemo<Project[]>(
    () => [
      {
        id: 'md2red',
        title: 'md2red',
        subtitle: isZh ? '小红书卡片排版器' : 'Xiaohongshu Card Formatter',
        description: isZh
          ? '把 Markdown 笔记即时转换为适合小红书发布的移动端卡片，并在同一工作区完成预览、文案复制与内容调整。'
          : 'Turn Markdown notes into mobile-first Xiaohongshu cards, with editing, preview, and post-copy tools in one workspace.',
        features: isZh
          ? ['Markdown 即时预览', '移动端卡片样式', '示例恢复与文件导入', '发布文案一键复制']
          : ['Live Markdown preview', 'Mobile card layout', 'Sample restore and file import', 'One-click post copy'],
        image: '/assets/work/md2red-workspace.png',
        imageAlt: isZh ? 'md2red 编辑器与小红书卡片预览' : 'md2red editor and Xiaohongshu card preview',
        href: '/md2red',
        status: 'AVAILABLE',
      },
      {
        id: 'shiyun-wechat-md',
        title: 'shiyun-wechat-md',
        subtitle: isZh ? '公众号排版转换器' : 'WeChat Post Formatter',
        description: isZh
          ? '为「时韵的 AI 自习室」定制的 Markdown 排版工具，支持表格、引用、代码块，并可直接复制富文本到公众号后台。'
          : 'A custom Markdown formatter for the Shiyun WeChat brand, with tables, quotes, code blocks, and rich-text copy.',
        features: isZh
          ? ['品牌化公众号主题', '结构化标题与引用', '表格和代码块排版', '富文本一键复制']
          : ['Branded WeChat theme', 'Structured headings and quotes', 'Table and code styling', 'One-click rich-text copy'],
        image: '/assets/work/wechat-workspace.png',
        imageAlt: isZh ? '公众号 Markdown 编辑器与富文本预览' : 'WeChat Markdown editor and rich-text preview',
        href: '/shiyun-wechat-md',
        status: 'AVAILABLE',
        imagePosition: 'object-[center_36%]',
      },
      {
        id: 'timesync-agent',
        title: 'TimeSync Agent',
        subtitle: isZh ? 'AI 热点信息流' : 'AI Intelligence Stream',
        description: isZh
          ? '聚合上游 AI 热点 RSS，在服务边界完成字段归一化、本地分类与来源头像处理，再输出统一、可搜索的时间流。'
          : 'Aggregates AI news feeds, normalizes fields at the service boundary, classifies items locally, and serves one searchable timeline.',
        features: isZh
          ? ['多来源 RSS 聚合', '确定性分类与标签', '统一数据归一化', '搜索、筛选与刷新']
          : ['Multi-source RSS aggregation', 'Deterministic categories and tags', 'Shared data normalization', 'Search, filters, and refresh'],
        image: '/assets/work/ai-hot-stream.png',
        imageAlt: isZh ? 'AI 热点实时信息流页面' : 'Live AI intelligence timeline',
        href: '/hot',
        status: 'LIVE DATA',
        imagePosition: 'object-top',
      },
    ],
    [isZh],
  );

  return (
    <div className="w-full min-h-screen bg-ts-canvas pb-24">
      <div className="immersive-section text-left">
        <header className="grid gap-8 border-b border-ts-ink/10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="font-barlow text-xs font-bold tracking-[0.24em] text-ts-primary">{copy.eyebrow}</p>
            <h1 className="mt-4 font-display text-5xl font-black tracking-[-0.04em] text-ts-ink sm:text-6xl lg:text-7xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ts-ink/65 sm:text-lg">{copy.subtitle}</p>
          </div>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ts-ink/10 bg-ts-surface-elevated px-4 font-barlow text-xs font-bold tracking-wider text-ts-ink/70 shadow-sm">
            <Radio size={15} className="text-emerald-500" aria-hidden="true" />
            {copy.summary}
          </div>
        </header>

        <section className="space-y-24 py-16 sm:space-y-32 sm:py-24" aria-label={isZh ? '项目列表' : 'Project list'}>
          {projects.map((project, index) => {
            const reverse = index % 2 === 1;
            return (
              <motion.article
                key={project.id}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className={cn(
                  'grid items-center gap-9 lg:grid-cols-2 lg:gap-16',
                  reverse && 'lg:[&>*:first-child]:order-2',
                )}
              >
                <div className="group relative overflow-hidden rounded-[28px] border border-ts-ink/10 bg-ts-surface-elevated p-2.5 shadow-[0_24px_70px_rgba(15,23,42,0.10)] dark:shadow-black/30">
                  <div className="absolute inset-x-16 -top-16 h-40 rounded-full bg-ts-primary/20 blur-3xl" />
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-[#0d0b1d]">
                    <img
                      src={project.image}
                      alt={project.imageAlt}
                      className={cn(
                        'h-full w-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.015]',
                        project.imagePosition ?? 'object-center',
                      )}
                    />
                  </div>
                </div>

                <div className="max-w-xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-barlow text-xs font-bold tracking-[0.2em] text-ts-primary">0{index + 1}</span>
                    <span className="rounded-full border border-ts-ink/10 bg-ts-surface-elevated px-3 py-1 font-barlow text-[10px] font-bold tracking-[0.16em] text-ts-ink/60">
                      {project.status}
                    </span>
                  </div>
                  <p className="mt-6 font-barlow text-sm font-bold uppercase tracking-[0.16em] text-ts-ink/55">{project.title}</p>
                  <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ts-ink sm:text-4xl">{project.subtitle}</h2>
                  <p className="mt-5 text-[15px] leading-7 text-ts-ink/68 sm:text-base">{project.description}</p>
                  <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                    {project.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm leading-6 text-ts-ink/72">
                        <Check size={16} className="mt-1 shrink-0 text-ts-primary" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={project.href}
                    className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-ts-ink px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.12em] text-ts-canvas transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ts-canvas motion-reduce:transition-none"
                  >
                    {copy.explore}
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </section>

        <footer className="rounded-[28px] border border-ts-ink/10 bg-ts-surface-elevated px-6 py-10 text-center shadow-sm sm:px-10 sm:py-14">
          <Sparkles className="mx-auto text-ts-primary" size={22} aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ts-ink sm:text-3xl">{copy.footerTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ts-ink/60 sm:text-base">{copy.footerDescription}</p>
        </footer>
      </div>
    </div>
  );
};
