import { useMemo } from 'react';
import { ArrowRight, FileText, MessageSquare, Radio, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

type Project = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: typeof FileText;
  href: string;
  status: string;
  tag: string;
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
        icon: FileText,
        href: '/md2red',
        status: 'AVAILABLE',
        tag: isZh ? '小红书卡片排版' : 'XIAOHONGSHU FORMATTER',
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
        icon: MessageSquare,
        href: '/shiyun-wechat-md',
        status: 'AVAILABLE',
        tag: isZh ? '微信公众号排版' : 'WECHAT FORMATTER',
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
        icon: Radio,
        href: '/hot',
        status: 'LIVE DATA',
        tag: isZh ? 'AI 实时热点流' : 'AI INTELLIGENCE STREAM',
      },
    ],
    [isZh],
  );

  return (
    <div className="w-full min-h-screen bg-ts-canvas pb-24">
      <div className="immersive-section text-left">
        <header className="flex justify-start pt-10 pb-8 border-none">
          <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ts-ink/10 bg-ts-surface-elevated px-4 font-barlow text-xs font-bold tracking-wider text-ts-ink/70 shadow-sm">
            <Radio size={15} className="text-emerald-500" aria-hidden="true" />
            {copy.summary}
          </div>
        </header>

        <section className="py-12 sm:py-16" aria-label={isZh ? '项目列表' : 'Project list'}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {projects.map((project, index) => {
              const Icon = project.icon;
              return (
                <motion.article
                  key={project.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
                >
                  <Link
                    to={project.href}
                    className="group relative flex aspect-[3/2] flex-col justify-between overflow-hidden rounded-2xl border border-ts-ink/10 bg-gradient-to-br from-ts-canvas via-ts-surface-elevated to-ts-canvas p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-primary focus-visible:ring-offset-4 focus-visible:ring-offset-ts-canvas motion-reduce:transition-none select-none"
                  >
                    {/* Subtle radial dot grid pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(120,119,198,0.10)_1px,transparent_1px)] [background-size:20px_20px]" />

                    {/* Glowing ambient background orbs */}
                    <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-ts-primary/18 blur-3xl transition-transform duration-700 group-hover:scale-125" />
                    <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-500/12 blur-3xl" />

                    {/* Top Row: Icon Badge & Meta Status */}
                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-ts-ink/10 bg-ts-surface/80 p-2.5 shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                          <Icon className="h-5 w-5 text-ts-primary" aria-hidden="true" />
                        </div>
                        <span className="font-barlow text-xs font-bold tracking-[0.16em] text-ts-primary">0{index + 1}</span>
                      </div>
                      <span className="rounded-full border border-ts-ink/10 bg-ts-surface/60 px-3 py-1 font-barlow text-[10px] font-bold tracking-[0.16em] text-ts-ink/60 backdrop-blur-sm">
                        {project.status}
                      </span>
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="relative z-10 my-auto py-2">
                      <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ts-ink transition-colors group-hover:text-ts-primary">
                        {project.title} <span className="font-normal text-base sm:text-lg text-ts-ink/50">· {project.subtitle}</span>
                      </h2>
                      <p className="mt-2.5 line-clamp-3 text-xs sm:text-sm leading-5 sm:leading-6 text-ts-ink/68">
                        {project.description}
                      </p>
                    </div>

                    {/* Bottom Row: Feature badges & Action Button */}
                    <div className="relative z-10 flex items-center justify-between gap-3 pt-3 border-t border-ts-ink/10">
                      <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
                        {project.features.slice(0, 3).map((feature) => (
                          <span
                            key={feature}
                            className="rounded-md bg-ts-ink/5 px-2 py-0.5 font-barlow text-[10px] font-medium text-ts-ink/60"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 font-display text-xs font-bold uppercase tracking-[0.12em] text-ts-ink">
                        <span className="underline decoration-ts-ink/30 underline-offset-4">{copy.explore}</span>
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
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
