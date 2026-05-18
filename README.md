# MeetingPilot：AI 视频会议助手

MeetingPilot 是一个纯前端产品原型，用于展示“视频会议助手”的会前准备、会中结构化记录、会议纪要和待办跟进闭环。

## 技术栈

- React + Vite
- Tailwind CSS
- lucide-react 图标
- 纯前端本地状态
- 模拟 AI 生成逻辑，无后端、无数据库、无 API key

## 本地运行

```bash
npm install
npm run dev
```

构建验证：

```bash
npm run build
```

## 功能说明

- 内置示例会议：产品 V1 需求评审会
- 点击生成会前准备清单：会议目标、建议议程、准备清单、关键问题、潜在风险
- 会中结构化记录：支持添加关键讨论、决策、风险、待确认问题、临时行动项
- 点击生成会议纪要：摘要、核心结论、决策、风险、待办事项和下一步建议
- 待办跟进看板：支持待开始、进行中、已完成、有风险状态切换
- 右侧 AI 助手：执行风险概览、风险提醒、下次会议重点
- localStorage 保存：会中记录、会前准备清单、会议纪要、待办事项和任务状态
- 支持重置示例数据，便于演示时恢复初始状态

## 部署到 Vercel

1. 将项目推送到 GitHub。
2. 在 Vercel 导入仓库。
3. Framework Preset 选择 `Vite`。
4. Build Command 使用 `npm run build`。
5. Output Directory 使用 `dist`。

链接：https://richard37546.github.io/meetingpilot/
