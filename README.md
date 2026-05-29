# TemporalSync (时间同步) ⏳

`TemporalSync`（时间同步）是一个面向智能医学、科研工作与大模型应用开发者的个人集成工作台与知识集成流。项目融合了极高美学水准的现代化 Web 界面、实时 AI 资讯集成、多人自习室展示原型以及轻量化 Markdown 博客撰写系统。

---

## 🎨 视觉设计与设计系统

时间同步主站采用了高端精致的极简主义设计美学，致力于为用户提供无与伦比的第一眼震撼：
- **Canvas 画布底色** — 默认采用温润柔和的浅灰色底色（`#f8f6f4`），并支持暗色模式一键切换到深海军蓝夜空色（`#131B36`）。
- **浮动渐变光圈** — 背景层浮动着三个运用 CSS Keyframes 动画自动呈有机物理轨迹运行的模糊发光圆环（克莱因蓝、日落橙、紫罗兰），呈现类似 Google 品牌的高级流动感。
- **书法与排版字体** — 标题选用中式书法及高级衬线字体 `Noto Serif SC`（思源宋体），正文采用清晰的 `Inter` 无衬线系统，营造兼具人文艺术与前沿科技的阅读体验。
- **统一配色** — 采用日落玫瑰红（Sunset Rose `#B1555A`）作为核心主调强调色，搭配柔和的高对比度海军蓝进行视觉区隔。

---

## ✨ 核心版块

### 1. 关于 / 愿景展示 (`/`)
- 以沉浸式的巨幅书法字体设计展现主站愿景：“和你一起在智能医学时代慢慢自习”。
- 记录开发者在医学 AI 应用、研究生成长和效率工具方面的思考轨迹。

### 2. 工作台 / 今日情报 (`/dashboard`)
- 整合用户今日待办、数据同步面板和当日最新 AI 医疗简报。
- 采用与主站一致的落日橙与克莱因蓝卡片分割布局，视觉重点突出。

### 3. AI 热点 (`/hot`)
- 实时聚合最新的全球大语言模型开发进展、AI 生物医药、科研动态等精选资讯。
- 提供结构化的信息聚合流，支持按时间排序和快速导航。

### 4. 自习室 (`/study`)
- 开发者用于展示独立应用和原型成果的实验性沙盒。
- 采用左右交叉的 Zigzag（锯齿状）轮换图文排布，具备极高的响应式适配能力。
- **互动性 md2red 模拟编辑器** — 内置了一个直接运行在主站页面内的 `md2red` 迷你交互编辑器。用户在此直接输入 Markdown，可实时编译（通过 `marked` 库解析）并渲染成高度逼真的小红书分享卡片预览。

### 5. 博客系统 (`/blog`)
- 一个面向读者的轻量化笔记/博客发布平台。
- **游客免登录阅读** — 所有人无需登录即可直接阅读全部文章，支持代码高亮、表格、引用等标准 Markdown 语法渲染。
- **作者权限撰写** — 集成了 Google OAuth (Firebase Auth) 单点登录。只有通过认证的作者能够进入博客撰写后台，支持实时双栏同步渲染预览，并对发布的博文进行全生命周期的编辑与删除。

### 6. 控制中心 / 设置 (`/settings`)
- 允许用户自由调节网站主色调（Accent Color）、字号缩放（Font Size）以及系统语言（中/EN）。
- 提供系统主题设置（跟随系统/亮色/暗色），实现深浅模式的无缝平滑切换。

---

## 🛠️ 技术栈

- **前端技术**：React 19 (TypeScript) + React Router v6 (前端路由，动态 Lazy-load 组件)
- **构建工具**：Vite 6
- **样式系统**：Tailwind CSS v4 (通过 `@tailwindcss/vite` 深度融合)
- **动画系统**：Motion.react (原 Framer Motion) + CSS 物理阻尼动画
- **数据与安全**：Firebase v10 (Firebase Auth + Firestore 实时 NoSQL 数据库)
- **Markdown 引擎**：Marked (支持实时高性能编译)

---

## 🚀 本地运行与配置指南

### 环境依赖
- 安装 Node.js (推荐 v18+)

### 1. 配置环境变量

在 `主网站-时间同步/` 根目录下，基于 `.env.example` 复制并重命名为 `.env` (或 `.env.local`)，填写您的 Firebase 和 API 配置信息：

```env
VITE_FIREBASE_API_KEY="您的Firebase API Key"
VITE_FIREBASE_AUTH_DOMAIN="您的Firebase域名"
VITE_FIREBASE_PROJECT_ID="您的Firebase项目ID"
VITE_FIREBASE_STORAGE_BUCKET="存储桶地址"
VITE_FIREBASE_MESSAGING_SENDER_ID="发送者ID"
VITE_FIREBASE_APP_ID="应用ID"
```

### 2. 安装依赖并启动

```bash
npm install
npm run dev
```

运行后，访问 `http://localhost:3000` (如果端口冲突，Vite 会自动递增端口)。

### 3. 构建并发布

```bash
npm run build
```

构建结果将被打包入 `dist/` 文件夹，并生成 Node 生产服务器对应的编译包 `dist/server.cjs`，非常利于服务端渲染（SSR）或容器化部署。
