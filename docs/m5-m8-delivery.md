# M5-M8 交付说明

## 已完成内容

### M5

- 首次进入的引导提示
- 存档导出 / 导入
- 大字模式 / 减少动画 / 引导开关
- `scripts/smoke-test.js`
- `README.md` 运行与存档说明

### M6

- 试炼模式
- 路线专精
- 路线专精达到阈值后影响产量、点击、石料、粮食、事件节奏

### M7

- 运行摘要
- 配置驱动内容检查
- `scripts/verify-release.js`

### M8

- `manifest.webmanifest`
- `service-worker.js`
- `assets/icon.svg`
- 静态发布缓存骨架

## 验证

```bash
node scripts/smoke-test.js
node scripts/verify-release.js
node --check src/game/data.js
node --check src/game/main.js
node --check service-worker.js
```
