import { useMemo, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

type Project = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  href: string;
  status: string;
  tag: string;
  image: string;
  imageAlt: string;
  category: 'reading' | 'formatting' | 'feed';
};

export const StudyRoom = () => {
  const { language } = useSettings();
  const reduceMotion = useReducedMotion();
  const isZh = language === 'zh';
  const [selectedCategory, setSelectedCategory] = useState<'all' | Project['category']>('all');

  const copy = isZh
    ? {
        eyebrow: 'PRODUCT TOOLKIT',
        title: '工具集',
        subtitle: '把内容工作流和信息处理中的真实摩擦，做成可以直接使用的小工具。',
        explore: '打开项目',
        all: '全部',
        categories: {
          reading: '阅读',
          formatting: '排版',
          feed: '资讯',
        },
        footerTitle: '持续把高频问题做成可靠工具',
        footerDescription: '每个项目都从一个真实使用场景开始，再用最短路径验证价值。',
      }
    : {
        eyebrow: 'PRODUCT TOOLKIT',
        title: 'TOOLS',
        subtitle: 'Small, usable tools built around real friction in content and information workflows.',
        explore: 'Open project',
        all: 'All',
        categories: {
          reading: 'Reading',
          formatting: 'Formatting',
          feed: 'Feed',
        },
        footerTitle: 'Turning repeated friction into reliable tools',
        footerDescription: 'Every project starts with a real workflow and takes the shortest path to useful.',
      };

  const projects = useMemo<Project[]>(
    () => [
      {
        id: 'lexora',
        title: 'Lexora',
        subtitle: isZh ? 'AI 概念智库与导师' : 'AI Concept Hub & Tutor',
        description: isZh
          ? '全屏双轨交互的专业概念卡片智库，支持双语名词对比、结构化深度拆解、历史记录删除与 DeepSeek AI Tutor 随身问答。'
          : 'Full-screen dual-rail AI concept card library with bilingual terminology, structured deep-dives, history deletion, and DeepSeek AI Tutor.',
        features: isZh
          ? ['AI 概念深度拆解', 'AI Tutor 随身问答', '双语对照与结构化卡片', '历史记录与精准检索']
          : ['Deep AI concept breakdown', 'AI Tutor follow-up QA', 'Bilingual terminology cards', 'History & precision search'],
        href: '/lexora',
        status: 'AVAILABLE',
        tag: isZh ? 'AI 概念智库' : 'AI CONCEPT HUB',
        image: '/assets/lexora/ai-result.jpg',
        imageAlt: isZh ? 'Lexora 实际术语解读页面' : 'Lexora contextual term explanation page',
        category: 'reading',
      },
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
        href: '/md2red',
        status: 'AVAILABLE',
        tag: isZh ? '小红书卡片排版' : 'XIAOHONGSHU FORMATTER',
        image: '/assets/work/md2red-workspace.png',
        imageAlt: isZh ? 'md2red 实际编辑与手机预览页面' : 'md2red editor and phone preview workspace',
        category: 'formatting',
      },
      {
        id: 'shiyun-wechat-md',
        title: 'shiyun-wechat-md',
        subtitle: isZh ? '公众号排版转换器' : 'WeChat Post Formatter',
        description: isZh
          ? '为「时韵 AI 工作台」定制的 Markdown 排版工具，支持表格、引用、代码块，并可直接复制富文本到公众号后台。'
          : 'A custom Markdown formatter for the Shiyun WeChat brand, with tables, quotes, code blocks, and rich-text copy.',
        features: isZh
          ? ['品牌化公众号主题', '结构化标题与引用', '表格和代码块排版', '富文本一键复制']
          : ['Branded WeChat theme', 'Structured headings and quotes', 'Table and code styling', 'One-click rich-text copy'],
        href: '/shiyun-wechat-md',
        status: 'AVAILABLE',
        tag: isZh ? '微信公众号排版' : 'WECHAT FORMATTER',
        image: '/assets/work/wechat-workspace.png',
        imageAlt: isZh ? '公众号排版转换器实际工作区' : 'WeChat post formatter workspace',
        category: 'formatting',
      },
      {
        id: 'timesync-agent',
        title: 'TimeSync Agent',
        subtitle: isZh ? 'AI 资讯流' : 'AI Intelligence Stream',
        description: isZh
          ? '接入 AI HOT REST API，把近 7 天精选资讯与多来源热点事件统一成可搜索、可筛选的 AI 情报流。'
          : 'Uses the AI HOT REST API to turn curated seven-day news and multi-source events into one searchable intelligence stream.',
        features: isZh
          ? ['REST API 接入', '多来源热点事件', '原生分类与筛选', '搜索、筛选与刷新']
          : ['REST API integration', 'Multi-source hot topics', 'Native categories and filters', 'Search, filters, and refresh'],
        href: '/hot',
        status: 'LIVE DATA',
        tag: isZh ? 'AI 实时资讯流' : 'AI INTELLIGENCE STREAM',
        image: '/assets/work/ai-hot-stream.png',
        imageAlt: isZh ? 'AI 资讯流实际页面' : 'AI intelligence stream timeline',
        category: 'feed',
      },
    ],
    [isZh],
  );

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter((project) => project.category === selectedCategory);

  return (
    <div className="w-full min-h-screen bg-ts-canvas pb-24">
      <div className="immersive-section text-left">
        <section className="pb-12 pt-6 sm:pb-16 sm:pt-8" aria-label={isZh ? '项目列表' : 'Project list'}>
          <div className="mb-8 flex flex-wrap items-center gap-2 sm:mb-10">
            {(['all', 'reading', 'formatting', 'feed'] as const).map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={[
                    'inline-flex h-10 items-center rounded-full px-4 font-barlow text-xs font-bold tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ts-ink',
                    isActive
                      ? 'bg-ts-ink text-ts-canvas shadow-sm'
                      : 'bg-ts-surface-elevated text-ts-muted hover:bg-ts-surface hover:text-ts-ink',
                  ].join(' ')}
                  aria-pressed={isActive}
                >
                  {category === 'all' ? copy.all : copy.categories[category]}
                </button>
              );
            })}
          </div>

          <div className="grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-2">
            {filteredProjects.map((project, index) => {
              return (
                <motion.article
                  key={project.id}
                  className="h-full"
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
                >
                  <Link
                    to={project.href}
                    className="group relative flex h-full min-h-[440px] flex-col overflow-hidden rounded-[24px] bg-ts-surface shadow-[0_14px_38px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B587C] focus-visible:ring-offset-4 focus-visible:ring-offset-ts-canvas dark:focus-visible:ring-[#C7B7DF] dark:shadow-[0_16px_38px_rgba(0,0,0,0.32)] motion-reduce:transition-none select-none"
                  >
                    <div className="relative h-56 shrink-0 px-3 pt-3 sm:h-64 sm:px-4 sm:pt-4 lg:h-[280px]">
                      <div className="relative h-full overflow-hidden rounded-[18px] bg-ts-canvas shadow-md">
                        <img
                          src={project.image}
                          alt={project.imageAlt}
                          className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.025] dark:brightness-[0.78] dark:saturate-[0.86] motion-reduce:transition-none"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-black/10 dark:bg-black/25" />
                        <span className="absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1.5 font-barlow text-[10px] font-bold tracking-[0.16em] text-white shadow-sm backdrop-blur-md">
                          0{index + 1}
                        </span>
                        <span className="absolute right-3 top-3 rounded-full bg-black/45 px-3 py-1.5 font-barlow text-[10px] font-bold tracking-[0.16em] text-white/90 backdrop-blur-md">
                          {project.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col justify-between p-5 sm:p-6">
                      <div>
                        <p className="mb-2 font-barlow text-[10px] font-bold tracking-[0.18em] text-[#6B587C] dark:text-[#C7B7DF]">{project.tag}</p>
                        <h2 className="font-display text-xl font-bold tracking-tight text-ts-ink transition-colors group-hover:text-[#6B587C] dark:group-hover:text-[#C7B7DF] sm:text-2xl">
                          {project.title} <span className="font-normal text-base sm:text-lg text-ts-ink/50">· {project.subtitle}</span>
                        </h2>
                        <p className="mt-2.5 line-clamp-3 text-xs leading-5 text-ts-ink/68 sm:text-sm sm:leading-6">
                          {project.description}
                        </p>
                      </div>

                      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
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
                        <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 font-display text-xs font-bold uppercase tracking-[0.12em] text-ts-ink/80 transition-colors group-hover:text-[#6B587C] dark:group-hover:text-[#C7B7DF] sm:ml-0">
                          <span>{copy.explore}</span>
                          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
                        </span>
                      </div>
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
