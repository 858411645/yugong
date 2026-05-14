# 愚公移山

纯前端放置点击游戏，无构建系统，直接用浏览器打开 `index.html` 即可游玩。

## 运行

```bash
node scripts/smoke-test.js
node scripts/verify-release.js
```

验证脚本会加载游戏数据和主逻辑，检查 M4-M8 内容是否能初始化，并检查发布资产是否完整。

本地试玩可以直接打开 `index.html`。PWA 和 Service Worker 需要通过本地 HTTP 服务访问才会启用，直接用文件协议打开时会自动跳过注册。

## 当前里程碑

- M1-M3：核心挖山、资源、子民、升级、科技、村庄、转生、奇遇、存档。
- M4：山脉档案、山脉特性、阶段目标、成就、事件扩展。
- M5：新手引导、导入/导出存档、可访问性设置、自动 smoke test。
- M6：试炼模式、路线专精与额外功德奖励，用于构筑分化。
- M7：运行摘要、配置驱动内容检查、发布资产检查，便于后续调参与发布。
- M8：manifest、图标与 Service Worker 发布骨架。

## 存档

当前存档 key 为 `yugong_save_v4`，会兼容读取旧 key：

- `yugong_save_v3`
- `yugong_save_v2`
- `yugong_save_v1`

页面顶部支持导出和导入 JSON 存档。
