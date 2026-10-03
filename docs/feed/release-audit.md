# 2026-10-01 发布检查

## 从页面需求到部署的数据流

浏览器 `/hot` → 同域 `/api/*` → `node-functions/api/[[default]].ts` → 上游 API → 校验、归一化 → 卡片。

Vite 将页面构建为 `dist/` 静态资源。EdgeOne 从 Git 源码识别 Node Functions 并独立打包；`npm run build:server` 用于 Express 部署，不是 EdgeOne 的 API 入口。共享服务代码在 `shared/`，无需在函数运行时读取源码文件。`_routes.json` 的 API 排除规则保持现有配置。

## 本次修复

| 问题 | 修复及目的 |
| --- | --- |
| 仓库跟踪已安装依赖和旧构建产物 | 移除 Git 跟踪并增加忽略规则；本地文件保留。EdgeOne 从锁文件重建。 |
| 安装与 Node 版本随部署环境变化 | `installCommand: npm ci`、`nodeVersion: 22.17.1`，满足锁定依赖的 Node 要求。 |
| 清理失败仅打印错误，构建仍继续 | 清理失败退出，避免发布旧产物；只清理 `dist`。 |
| Vite 中间件与 Express 重复实现 Lexora API | 本地统一由 Express 处理 API，移除重复且未类型化的实现。 |
| 外部 AI HOT JSON 直接断言类型 | 检查字段、HTTP(S) 链接和日期；无效记录隔离，全无效返回上游错误。浏览器再次校验。 |
| 原 Feed 浏览器缓存无限期有效 | 5 分钟过期；可见时每 15 分钟检查，回到前台检查。 |
| 部分 Node API 无请求超时 | 资讯/博客 10 秒、论文 12 秒、Lexora 25 秒；浏览器设置相应超时。 |
| Lexora 非字符串/null 请求导致运行异常 | 输入类型/长度与模型返回结构校验，隐藏上游原始错误。 |
| API 方法与 SPA fallback 混淆 | Node Functions 返回 405/OPTIONS，Express 未知 API 返回 JSON 404。 |
| 统一 API 缓存规则可能覆盖错误响应策略 | 动态缓存由各函数响应头控制；错误、过期数据与 AI 对话 `no-store`。 |
| 上海日期筛选使用 UTC 日终 | 显式使用 +08:00 的日期边界，排除已属于上海次日的时间戳。 |
| Supabase 部署文档表名写成 blog_posts | 校正为迁移和代码使用的 blogs；未修改数据库。 |
| npm 检出已知依赖漏洞 | 在现有版本范围内更新 16 个包；最终全依赖扫描 0 项漏洞。 |

## 验证证据

隔离发布副本不含本地“相见”和“神经计算工作站”改动，不复制任何 `.env` 文件。

- Node 22.17.1 全新 `npm ci` 成功。
- `npm run lint`、23 项回归测试、`npm run build`、`npm run build:server` 成功。
- Node Functions 独立 ESM bundle 成功；实际调用三个 Feed 接口均 200，分别 100/10/60 条。
- `npm audit` 全依赖扫描：0 项已知漏洞（仅代表当前 npm 数据库报告）。
- Express 生产构建 `/hot`、`/blog`、`/settings` 直接访问 200；未知 API JSON 404。
- 1440px 桌面、390px 手机生产页面无横向溢出；原资讯流/热点/论文切换正常。
- GitHub CI 对 PR 与 main 运行安装、类型、测试及三种构建。

## 验证边界

- 论文按访问触发、实例内缓存，无独立定时任务或持久化论文库。无新收录论文时保留近期内容。
- 博客代码以 anon 公共权限读取，写权限依赖数据库 RLS 和可信 app_metadata。仓库中已有迁移；本轮未重新连接生产数据库核验其当前策略。
- Lexora 通过模拟输入和响应验证边界，本轮未消耗付费模型额度核验回答质量。
- 本地构建和云函数入口验证不等同于 EdgeOne 平台构建成功；推送后应查看对应提交的部署状态和预览 URL。
- 按 AGENTS.md 发布步骤，功能分支推送后提供 PR/预览；合并 main 须收到用户明确指令。

## 2026-10-03 发布副本验证

专业 Feed 当前只保留 Europe PMC 论文。隔离发布副本类型、21 项测试、前端/Express/Node Functions 构建通过；Express 与 Node Functions 实际请求均返回 60 篇论文及单一来源。1280px 桌面与 390px 手机页面、搜索和刷新已验证。更新截图见 [Feed 文档](README.md)。

本轮发布仅包含专业 Feed 清理；本地未提交的其他页面未纳入发布副本。合并 main 后由 EdgeOne 自动部署，线上结果以部署状态和实际页面/API 核验为准。

## 官方依据

- [EdgeOne 构建指南](https://edgeone.cloud.tencent.com/pages/document/162936788693114880)
- [EdgeOne 配置](https://edgeone.cloud.tencent.com/pages/document/162936771610066944)
- [EdgeOne CLI 与 Node Functions 部署](https://edgeone.cloud.tencent.com/pages/document/162936923278893056)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Europe PMC API](https://europepmc.org/RestfulWebService)
