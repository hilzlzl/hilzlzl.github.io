---
title: CourseAgent：从课程需求到可核验的作业交付
date: 2026-10-27 10:00:00
updated: 2026-10-27 10:00:00
categories:
  - 项目实践
tags:
  - AI Agent
  - LangGraph
  - 教学工具
  - 任务恢复
excerpt: 将教师需求与课程资料转成有来源、可核验、可恢复的课程作业。普通题与编程题并行搜集，核对答案、执行参考程序，并导出文件或保存到头歌未发布试卷。
---

给数据结构课布置一次作业，工作并不止于“生成几道题”。题目需要贴合课程范围，答案与样例需要核对，编程题需要评测数据，最后还要把整套作业放到教师实际使用的平台上。中间某一步失败，也希望能从已有成果继续。

[CourseAgent](https://github.com/hilzlzl/CourseAgent) 把这个过程组织成一个基于 LangGraph 的本地 Agent 应用：从教师需求与课程资料出发，经过搜题、筛选、核验和交付，输出可供教师审阅的作业。

<div class="project-links"><a href="https://github.com/hilzlzl/CourseAgent" target="_blank" rel="noopener noreferrer">GitHub 源码 ↗</a><a href="https://github.com/hilzlzl/CourseAgent/blob/main/docs/quickstart.md" target="_blank" rel="noopener noreferrer">安装与使用 ↗</a><a href="/projects/#courseagent">项目概览 →</a></div>

## 从一个具体需求开始

例如，教师可以提交这样的需求：

> 给数据结构课程布置一次关于栈和队列的作业，包含 4 道单选题、4 道判断题和 4 道编程题，提供参考答案、公开样例与隐藏评测数据。

有文字层的 PDF 或 DOCX 可以作为课程范围参考。普通题与编程题分别搜集，再结合考点、课程资料和选题历史筛选。上传资料提供了范围约束，最终题目是否适合课堂仍需教师判断。

## 一套作业如何形成

流程由持久化任务队列与 LangGraph 编排：

1. **理解需求与课程范围。** 确定知识点、题型、数量和交付目标。
2. **并行搜集题目。** 普通题与编程题分别查找来源，按课程范围和历史选题筛选。
3. **核验答案与参考程序。** 核对公开样例，在 Linux 沙箱内运行参考程序，生成编程评测数据。
4. **检查整套结果。** 检查题量、范围与验证状态，在预算内补搜与修复。
5. **导出或交付。** 生成 Excel、JSON 与教师评测包；默认保存至头歌未发布试卷，回读核对后由教师正式发布，也可选择仅本地生成。

搜题、编程执行、平台保存是不同阶段，保留各阶段结果，才能知道失败发生在哪里，以及哪些成果可以复用。模块关系见[系统架构](https://github.com/hilzlzl/CourseAgent/blob/main/docs/architecture.md)。

## 任务中断后如何继续

任务队列与 LangGraph 检查点保存在 SQLite 中，心跳租约用于管理执行中的任务，逐题缓存复用已经通过的验证结果。题目内容发生变化时，相关验证凭据会失效，避免把旧检查误用在新内容上。

任务需要处理时，可以在页面查看失败阶段与已保留成果，修正配置后在原任务继续。恢复设计围绕已保存的任务状态与验证结果展开。

## 本次实验观察

公开实验覆盖 **20 组需求，每组运行 3 次，共 60 次任务、876 题次**。以下只摘录 CourseAgent 的生成完成情况：

| 指标 | 结果 |
| --- | ---: |
| 题目完成 | 852/876（97.26%） |
| 整套任务完成 | 55/60（91.67%） |
| 普通题完成 | 470/474 |
| 编程题完成 | 382/402 |
| 耗时 P50 / P90 | 607 / 1,320 秒 |

完成率按生成结果统计，题目质量与平台保存回读分别评估。完成一道题并不等于其答案与教学适用性已经获得独立确认；有限样例和参考程序核验也有覆盖边界。完整实验设置、对照方式和评分规则见[实验评估](https://github.com/hilzlzl/CourseAgent/blob/main/docs/evaluation.md)，统计范围与公开记录见[实验记录](https://github.com/hilzlzl/CourseAgent/tree/main/evaluations)。

## 在本地试一下

推荐 Linux 或 Windows WSL2，Python 3.11+。先克隆仓库，再在项目目录执行：

```bash
git clone https://github.com/hilzlzl/CourseAgent.git
cd CourseAgent
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.lock.txt
python -m pip install --no-deps -e .
python -m scripts.doctor
python -m scripts.demo
bash start.sh
```

打开 `http://127.0.0.1:8765/`。固定离线演示不需要 API Key，会在 `outputs/demo/` 生成示例文件；它与网页中的真实搜题任务相互独立。锁文件是 Linux / Python 3.12 的发布依赖快照，其他环境的安装方式见[运行指南](https://github.com/hilzlzl/CourseAgent/blob/main/docs/quickstart.md)。

真实搜题前，将 `model-config.example.json` 复制为 `model-config.local.json`，配置自己的模型服务。编程执行还需要 Linux bubblewrap 与相应编译器；平台交付需要 Node.js、Chrome 和教师账号登录。只需要导出文件时，选择“仅本地生成”。

## 交付边界

平台端默认保存为**未发布试卷**，正式发布由教师完成。教师评测包包含参考答案与隐藏用例，应由教师保管。扫描 PDF、复杂公式和多答案特殊判题支持有限，最终作业仍需审阅。

项目采用 MIT 许可，当前实现、依赖和配置以 [GitHub 仓库](https://github.com/hilzlzl/CourseAgent)为准。
