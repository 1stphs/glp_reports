# GLP-Intelligence Suite (POC)

> **Vision**: 构建 GLP 实验室的 **"In Silico Workforce" (虚拟科研助理)**。
> **Core Value**: 用计算 (*In Silico*) 解决湿实验 (*In Vitro/Vivo*) 的效率问题，打造科学家的“第二大脑”。

---

## 🚀 项目背景 (Overview)

本项目是 **GLP-Intelligence Suite** 的概念验证 (POC) 版本。旨在展示如何通过 **In Silico 协同平台** 解决 GLP 实验室中报告撰写繁琐、数据处理复杂、合规要求严格的痛点。

我们不只是提供工具，而是构建一支虚拟的 **In Silico 科研助理团队**。

## 🎯 POC 核心目标 (Phase 0: BioAnalyst)

当前的 POC 聚焦于 **SKU 2: GLP-BioAnalyst (生物分析助理)** 的核心能力验证：

**"Raw Data In, Report Out. 告别复制粘贴，体验毫秒级合规。"**

### 核心能力演示
1.  **感知层 (Perception)**:
    -   **自动索引**: 智能扫描并解析 `original docs` 中的原始数据与文档，构建项目级的感知索引 (Documentation Index)。
    -   **渐进式披露**: 通过 `docs_index.md` 为 LLM 提供结构化的文件目录与摘要，作为 AI 的“眼睛”。
2.  **认知与技能 (Cognition & Skills)**:
    -   **Dual-Brain Architecture (双脑架构)**: 
        -   **左脑 (Logic)**: 负责确定性计算 (Bias%, CV%, t-test)，确保数据绝对准确（概念设计）。
        -   **右脑 (Language)**: 负责基于确定性结论生成符合 SOP 语法的报告文本。
3.  **表达层 (Expression)**:
    -   生成标准化的 GLP 方法学验证报告摘要与数据汇总。

---

## 📂 项目结构 (Structure)

```
.
├── original docs/           # [Raw Data Layer] 原始数据与文档仓库
│   ├── markdown_docs/       # 经过解析脱敏的 Markdown 格式文档
│   └── docs_index.md        # [Perception Output] 全局文档索引 (AI 读入口)
├── scripts/                 # [Skill Layer] 自动化脚本工具
│   ├── generate_index.py    # 文档索引生成脚本 (核心初始化工具)
│   └── extract_docs.py      # 文档提取与处理工具
├── 系统设计与开发文档/        # [Blueprint] 系统设计说明书
└── README.md                # 项目说明
```

## 🛠️ 快速开始 (Quick Start)

### 1. 环境准备 (Prerequisites)
- Python 3.8+
- 建议创建虚拟环境:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### 2. 初始化 POC (Initialize POC)
为了让智能助理“感知”到当前的项目资料，需运行初始化脚本生成全局索引。

```bash
# 生成文档索引与摘要
python3 scripts/generate_index.py
```

> **Note**: 该命令会扫描 `original docs/markdown_docs` 下的所有文件，提取元数据与摘要，并生成 Updated `original docs/docs_index.md`。这个 Index 文件是 AI 理解整个项目上下文的关键入口。

### 3. 下一步 (Next Steps)
- 查看生成的 `original docs/docs_index.md`，确认所有文档已被正确索引。
- 结合 `系统设计与开发文档/系统概念设计.md`，深入了解完整系统的架构蓝图。

---

## 📚 核心文档引用
- **系统蓝图**: [系统概念设计](系统设计与开发文档/系统概念设计.md)
