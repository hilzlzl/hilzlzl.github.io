---
title: 项目
layout: page
---

<div class="project-label">FEATURED PROJECT / 01</div>

## Reliable Deep Research

**可恢复、证据可追溯的深度研究系统。**

基于 LangChain Open Deep Research，使用 Python、LangGraph、asyncio、Pydantic 和 SQLite。围绕长任务中断、报告遗漏问题要点和引用支持不足三个问题，增加持久化任务运行时、问题覆盖审核和有界反馈修复。

<div class="project-links"><a href="/2026/10/22/reliable-deep-research/">阅读项目介绍 →</a><a href="/2026/10/22/reliable-deep-research-recovery/">任务恢复设计 →</a><a href="/downloads/reliable-deep-research.zip">下载源码 ZIP ↓</a></div>

### 工程重点

| 方向 | 实现 |
| --- | --- |
| 任务恢复 | DAG 调度与 SQLite 持久化，复用已提交的任务结果 |
| 报告覆盖 | 在读取证据前固定问题要点，审核段落的语义支持与回答覆盖 |
| 反馈修复 | 最多 2 轮修复、2 个定向补搜任务，受共享预算约束 |
| 证据追溯 | 由 Evidence ID 确定性生成引用，保留事件轨迹 |

### 如何阅读结果

在本次 30 道问题、每题 2 次的开发评测中，Reliable Deep Research 验收通过 59/60，全部尝试要点覆盖为 88.7%，抽样引用支持为 93.6%。

这些数值描述本次开发后交付的实际结果。参考要点由助手编写，生成与评审使用同一网关模型别名，尚无独立人工验证；样本选择与配置变化限制了因果解释。完整协议、逐项数据和局限随源码发布，见压缩包中的 `docs/evaluation.zh-CN.md`。

源码快照：`a4e9b4c`，保留原项目 MIT 许可证与上游说明。它是可下载、可本地运行的研究项目；本站展示项目文档与技术笔记。
