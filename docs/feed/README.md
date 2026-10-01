# 神经精神影像 · AI Feed

本地分支：`codex/neuro-feed`。预览：`http://localhost:3000/hot`，选择「神经精神影像 · AI」。

## 已实现

- 保留原有资讯流、热点，新增专业入口及「全部 / 论文 / 公众号」筛选、搜索和刷新。
- 通过 Europe PMC 公开接口获取最近 90 天的论文，最多展示最新 60 条；检索要求同时匹配疾病、影像/脑信号和 AI 方法。
- 疾病涵盖抑郁症、阿尔茨海默病、帕金森病和双相情感障碍；不限制单一影像模态。
- 按发表日期倒序分组，卡片展示原文标题、期刊、日期、原始摘要节选和原文链接，预印本单独标注。无 AI 解读或翻译。
- 服务端按需获取，成功结果缓存 1 小时；上海日期变化时重新获取。页面可见时每 15 分钟检查更新，重新进入或回到页面也会检查。浏览器缓存 5 分钟，手动刷新会重新请求服务端。
- 单个来源失败不影响其他来源；存在上次成功数据时保留至多 7 天并提示更新失败，显示真实的最近同步时间。

## 公众号状态与后续接入

用户已确认先完成论文更新和公众号入口。目前没有这四个账号的可用订阅地址，页面明确显示「公众号待接入」，没有演示文章。

可通过服务端环境变量 `NEURO_WECHAT_FEEDS` 配置 JSON 对象，以以下 ID 为键、对应账号的 HTTPS RSS/Atom 订阅地址为值。可以逐个接入；地址只在服务端使用，不返回给浏览器，不记录到日志或仓库。

| ID | 来源 |
| --- | --- |
| `psycho-imaging` | 精神影像学 |
| `intelligent-medicine` | intelligent medicine智慧医学 |
| `brain-mental-health` | 脑科学与心理健康 |
| `neuroai` | NeuroAI影响前沿 |

仅展示具有真实发表日期、标题及微信原文链接的文章。配置来源报错与尚未接入分开显示。接入时需核对账号身份；本项目不提供微信扫码采集服务。

## 接口与验证

`GET /api/neuro-feed` 在 Express 与 Node Functions 共用同一获取逻辑，返回 `items`、`sources`、`fetchedAt`。来源状态为 `ready`、`unconfigured`、`error` 或 `stale`。

- 发布副本使用 Node 22.17.1、`npm ci` 全新安装：类型检查、23 项测试、前端/Express/Node Functions 构建通过。
- 真实 Node Functions 入口返回 Timeline 100 条、热点 10 条、论文 60 条；4 个公众号保持待接入。
- 1440px 桌面、390px 手机生产构建已检查，无横向溢出，资讯流/论文卡片和公众号入口正常。
- 原资讯流与热点浏览器缓存改为 5 分钟，页面可见时每 15 分钟检查，回到前台也检查。

截图：[Timeline 桌面](screenshots/release-timeline-desktop.jpg)、[论文桌面](screenshots/release-neuro-desktop.jpg)、[论文手机](screenshots/release-neuro-mobile.jpg)。

构建审计与验证边界见 [发布检查](release-audit.md)。

论文元数据、摘要与排序参数依据 [Europe PMC 官方 API 文档](https://europepmc.org/RestfulWebService)。内容新鲜度受来源收录时间影响；没有新论文时保持已有近期内容。
