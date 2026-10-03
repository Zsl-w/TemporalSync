# 神经精神影像 · AI Feed

本地分支：`codex/remove-wechat-feed`。预览：`http://localhost:3000/hot`，选择「神经精神影像 · AI」。

## 已实现

- 保留原有资讯流、热点，专业论文入口提供搜索和刷新。
- 通过 Europe PMC 公开接口获取最近 90 天的论文，最多展示最新 60 条；检索要求同时匹配疾病、影像/脑信号和 AI 方法。
- 疾病涵盖抑郁症、阿尔茨海默病、帕金森病和双相情感障碍；不限制单一影像模态。
- 按发表日期倒序分组，卡片展示原文标题、期刊、日期、原始摘要节选和原文链接，预印本单独标注。无 AI 解读或翻译。
- 服务端按需获取，成功结果缓存 1 小时；上海日期变化时重新获取。页面可见时每 15 分钟检查更新，重新进入或回到页面也会检查。浏览器缓存 5 分钟，手动刷新会重新请求服务端。
- 论文来源请求失败时，存在上次成功数据则保留至多 7 天并提示更新失败，显示真实的最近同步时间。

## 接口与验证

`GET /api/neuro-feed` 在 Express 与 Node Functions 共用同一获取逻辑，返回 `items`、`sources`、`fetchedAt`。来源状态为 `ready`、`error` 或 `stale`。

- 论文接口只返回 Europe PMC 来源与论文条目。
- 2026-10-03 隔离发布副本（不含本地未完成页面）类型检查、21 项测试、前端/Express/Node Functions 构建通过。
- Express 与构建后的 Node Functions 论文接口实际调用成功，均只返回 Europe PMC 来源与 60 篇论文。
- 本地 1280px 桌面、390px 手机截图已检查，无横向溢出；搜索、刷新、日期分组与卡片动效保留。
- 原资讯流与热点浏览器缓存为 5 分钟，页面可见时每 15 分钟检查，回到前台也检查。

截图：[Timeline 桌面](screenshots/release-timeline-desktop.jpg)、[论文桌面](screenshots/papers-desktop.png)、[论文手机](screenshots/papers-mobile.png)。

构建审计与验证边界见 [发布检查](release-audit.md)。

论文元数据、摘要与排序参数依据 [Europe PMC 官方 API 文档](https://europepmc.org/RestfulWebService)。内容新鲜度受来源收录时间影响；没有新论文时保持已有近期内容。
