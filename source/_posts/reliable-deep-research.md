---
title: Reliable Deep Research：让研究任务可恢复，让报告有据可查
date: 2026-10-22 10:00:00
updated: 2026-10-22 10:00:00
categories:
  - 项目实践
tags:
  - AI Agent
  - LangGraph
  - Deep Research
excerpt: 基于 Open Deep Research，增加持久化任务运行时、问题覆盖审核和有界语义修复。本文介绍设计取舍、开发评测结果，以及无需密钥的本地演示。
---

一次深度研究可能持续数分钟，反复调用模型和检索工具。如果进程中断，已经完成的任务能否继续使用？报告中的网址即使真实存在，能否支持它旁边的陈述？报告又是否回答了原问题的每个要点？

Reliable Deep Research 尝试把这些问题变成可记录、可检查的工程过程。

<div class="project-links"><a href="/projects/">项目概览 →</a><a href="/downloads/reliable-deep-research.zip">下载源码 ZIP ↓</a><a href="/2026/10/22/reliable-deep-research-recovery/">阅读任务恢复设计 →</a></div>

## 从上游到这个项目

项目基于 [LangChain Open Deep Research](https://github.com/langchain-ai/open_deep_research)。上游提供研究编排与模型、工具集成；这里增加持久化任务运行时，以及 **Evidence → 问题覆盖 → 已复核报告** 流水线。

使用的主要技术是 Python、LangGraph、asyncio、Pydantic 和 SQLite。改进重点有四个：

- **任务可恢复。** 有界 DAG 调度器持久化已完成任务与结果，重试失败任务，并清理未完成尝试遗留的过期证据。
- **围绕问题组织报告。** 读取证据前先固定问题要点，检查缺口，再按存储片段审核段落。
- **有界反馈修复。** 保留已核实段落，按当前审核意见修补答案和引用；最多 2 轮修复、2 个定向补搜任务。
- **执行有边界。** 并发任务共享模型调用、token、任务尝试和时间预算，留下验收结果与事件轨迹。

## 研究与报告如何衔接

研究问题首先转成任务 DAG。检索任务产生证据，任务结果与证据进入 SQLite；报告生成环节根据固定的问题要点和这些证据编写草稿。

随后，审核环节检查段落语义支持与问题覆盖。若有缺口，系统可以在剩余预算内安排定向补搜和修复；最后由 Evidence ID 确定性渲染引用。

这两条约束需要同时成立：任务执行有可恢复的状态，报告陈述有可追溯的来源。后者仍依赖可能出错的模型语义判断，不能因为存在一条引用就认定陈述正确。

## 本次开发评测结果

评测包含 30 道问题，每题独立运行 2 次，共 60 个评估槽位，使用 24 份固定参考来源。Repository Baseline 沿用上游研究流程，并保留仓库中的检索、模型接入和预算等实验适配；Claim-first 是早期对照方案。

| 指标 | Repository Baseline | Claim-first（早期方案） | Reliable Deep Research |
| --- | ---: | ---: | ---: |
| 验收通过 | 52/60 | 51/60 | 59/60 |
| 失败或超限 | 8 | 9 | 1 |
| 全部尝试要点覆盖 | 80.4% | 64.9% | 88.7% |
| 成功报告条件覆盖 | 93.1% | 75.7% | 90.3% |
| 抽样引用支持 | 60.9% | 96.1% | 93.6% |
| 平均耗时（秒） | 404.9 | 667.6 | 319.3 |
| 平均模型调用 | 9.52 | 19.42 | 15.25 |

覆盖分子只统计通过报告，失败计零；引用支持来自每份报告最多 5 条陈述的抽样。这里同时列出“全部尝试覆盖”和“成功报告条件覆盖”，避免忽略失败报告。

**结果的边界：** 参考要点由助手编写，生成和评审使用同一网关模型别名，尚无独立人工验证。表格展示开发后的实际交付结果，样本选择与配置变化限制了因果解释，不能据此直接推出对任意问题的普遍提升。

完整协议见源码中的 `docs/evaluation.zh-CN.md`；全部 180 条评估样本位于 `benchmarks/results/release_comparison.json`。

## 无需密钥的本地演示

先[下载源码](/downloads/reliable-deep-research.zip)并解压，安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)，在项目根目录运行。命令适用于 PowerShell 和 Bash：

```bash
uv sync --frozen --python 3.11 --extra dev
uv run --frozen python -m experiments.reliability.reliability_demo
uv run --frozen --extra dev python -m pytest -q
```

演示注入一次任务失败，执行重试，再重放依赖任务并复用已经完成的检索任务。产物位于 `artifacts/reliability_demo/`，包含 `result.json`、`events.jsonl` 和 `runtime.db`。

它验证的是合成任务的执行语义，不需要模型或检索密钥。

## 运行真实研究

复制 `.env.example` 为 `.env`，填写 `OPENAI_API_KEY` 和 `TAVILY_API_KEY`，再执行：

```bash
uv run --frozen python -m experiments.runners.run_research --question "What are the failure and recovery trade-offs of durable agent workflows? Cite primary sources."
```

真实研究会产生模型与检索费用。默认上限为 40 次模型调用、4 次检索、6 次任务尝试和 1,200 秒；每道题使用独立数据库，输出报告、验收摘要和事件轨迹。退出码非零表示该次运行未通过。

自定义 API、本地检索与产物说明见源码内的 `docs/running.zh-CN.md`。

## 阅读代码的入口

| 文件 | 关注的问题 |
| --- | --- |
| `task_runtime.py`、`runtime_store.py` | DAG 调度、结果事务提交、重试与重放失效处理 |
| `coverage_reporting.py`、`report_planning.py` | 问题拆解、审核、修复与证据引用渲染 |
| `run_budget.py`、`observability.py` | 共享预算与事件日志 |
| `experiments/runners/run_research.py` | 正式运行入口 |
| `tests/`、`benchmarks/` | 离线回归与数值证据 |

恢复边界是研究任务，不是整个 LangGraph 会话；外部 API 也不保证恰好执行一次。下一篇[任务恢复设计](/2026/10/22/reliable-deep-research-recovery/)进一步解释这条边界。
