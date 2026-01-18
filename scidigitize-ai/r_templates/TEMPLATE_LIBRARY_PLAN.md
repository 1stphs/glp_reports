# R 语言医学统计图表模版库构建计划 (R-Stat-Templates)

> **Role**: Senior Bio-Statistician & R Developer
> **Objective**: 构建一套工业级、配置驱动 (Configuration-Driven) 的医学统计绘图引擎。
> **Philosophy**: “Input JSON, Output Publication-Ready Plot”.

## 1. 项目架构 (Architecture)

模版库不仅仅是 R 脚本的集合，而是一个**严谨的软件包 (Package)** 结构。

```text
r_templates/
├── R/                          # 核心函数库
│   ├── theme_utils.R           # [Core] 通用主题定义 (NEJM, Lancet, JCO)
│   ├── io_utils.R              # [Core] JSON 解析与数据验证模块
│   ├── plot_survival.R         # [Module] 生存分析绘图函数
│   ├── plot_forest.R           # [Module] 森林图绘图函数
│   ├── plot_waterfall.R        # [Module] 瀑布图绘图函数
│   └── plot_nomogram.R         # [Module] 列线图绘图函数
├── tests/                      # 自动化测试
│   ├── testthat/               # 单元测试
│   └── fixtures/               # 测试用 JSON 数据与标准参考图
├── schemas/                    # [Contract] 输入数据的 JSON Schema 定义
│   ├── survival_schema.json
│   └── forest_schema.json
├── examples/                   # 示例 Gallery
│   └── demo_survival.R         # 演示脚本
├── renv.lock                   # [Environment] 严格的依赖版本锁定
└── DESCRIPTION                 # 包描述文件
```

## 2. 核心模块规划 (Module Roadmap)

### 2.1 基础建设 (Infrastructure)
*   **Theme Engine (`theme_utils.R`)**:
    *   预定义 `theme_nejm()`, `theme_lancet()`, `theme_nature()`。
    *   统一控制字体 (Arial/Times)、字号、边距、配色板。
*   **Validator (`io_utils.R`)**:
    *   入参检查：确保传入的 JSON 符合 Schema 定义，防止 R 脚本运行时报错。

### 2.2 模块一：生存分析 (Survival Analysis)
*   **Target**: Kaplan-Meier Curves
*   **Base Package**: `survminer`, `survival`
*   **Key Configs**:
    *   `risk.table`: 全局开关、样式 (absolute/percentage)、位置 (inside/outside)。
    *   `pval`: 计算方法 (Log-rank/Cox)、显示位置坐标。
    *   `censor`: 删失点形状 (`+` vs `|`) 与大小。
    *   `conf.int`: 透明度 (alpha) 与样式 (ribbon/step)。
*   **Output Standard**: 对齐 NEJM 标准，Risk Table 与主图 X 轴严格对齐。

### 2.3 模块二：森林图 (Forest Plots)
*   **Target**: Meta-analysis, Subgroup Analysis
*   **Base Package**: `forestploter` (推荐，比 old `forestplot` 更现代)
*   **Key Configs**:
    *   `ci_style`: Error bar 的端点样式 (T-bar vs Diamond)。
    *   `ref_line`: 无效线的位置 (1 或 0) 与线型。
    *   `cols_alignment`: 文本列 (HR, P-value) 的对齐方式。
    *   `zebra_stripe`: 相间背景色开关。

### 2.4 模块三：肿瘤瀑布图 (Waterfall Plots)
*   **Target**: Mutation Landscape, Response Rate
*   **Base Package**: `maftools` (ComplexHeatmap backend)
*   **Key Configs**:
    *   `sort_by`: 排序逻辑 (Mutation Burden / Response / Gene)。
    *   `color_map`: 突变类型的颜色映射字典。
    *   `annotation`: 顶部/底部的临床信息注释条 (Clinical Tracks)。

### 2.5 模块五：组间差异比较 (Group Comparisons) - *[High Frequency]*
*   **Target**: Boxplot, Violin Plot, Bar Plot with Error Bars.
*   **Base Package**: `ggpubr` (基于 ggplot2，优化的出版级绘图包).
*   **Key Configs**:
    *   `stat_method`: 检验方法 (t.test, wilcox.test, anova).
    *   `add_element`: 叠加元素 (jitter points, dotplot).
    *   `label`: P值显示格式 (p.signif vs p.format).
*   **Coverage**: 覆盖 Table 1 可视化、生物标志物水平差异等 40% 的基础统计场景。

### 2.6 模块六：诊断与预测模型评估 (Diagnostic Evaluation)
*   **Target**: ROC Curves, Calibration Curves.
*   **Base Package**: `pROC`, `rms`.
*   **Key Configs**:
    *   `auc_display`: 是否显示 AUC 值及置信区间。
    *   `smooth`: 是否平滑曲线。
    *   `optimal_cutpoint`: 最佳截断点标注。

### 2.7 模块七：高维组学可视化 (Omics Visualization)
*   **Target**: Volcano Plot (火山图), PCA.
*   **Base Package**: `EnhancedVolcano`.
*   **Key Configs**:
    *   `cutoffs`: P值与 FoldChange 的阈值线。
    *   `lab_size`: 显著基因的标签大小与数量控制。
*   **Scenario**: 毒理基因组学、靶点筛选。

### 2.8 模块八：纵向疗效泳道图 (Swimmer Plots)
*   **Target**: Patient Treatment Timeline & Response.
*   **Base Package**: `swimplot` (or Custom ggplot2).
*   **Key Configs**:
    *   `bar_color`: 治疗阶段颜色。
    *   `marker`: 事件标记 (CR, PR, PD, Death) 的形状。
*   **Scenario**: 肿瘤临床试验受试者病程全景展示。

### 2.9 模块九：共识与流向 (Consensus & Flow)
*   **Target**: Sankey Diagram, Alluvial Plot, CONSORT Flowchart.
*   **Base Package**: `ggalluvial`, `DiagrammeR`.
*   **Scenario**: 患者入组筛选流程、治疗方案切换分析。

## 3. 开发规范 (Standards)

1.  **函数式编程 (Functional Programming)**:
    *   所有绘图逻辑封装为**纯函数 (Pure Functions)**。
    *   输入：`config_list` (R list converted from JSON)。
    *   输出：`ggplot` 对象或 `grob` 对象。不仅绘图，还必须返回对象以便后续组合 (`patchwork`)。

2.  **防御性编程 (Defensive Programming)**:
    *   使用 `tryCatch` 捕获底层绘图错误。
    *   对 `NULL` 值参数提供合理的 Default 值 (Convention over Configuration)。

3.  **可测试性 (Testability)**:
    *   引入 `vdiffr` 包进行**视觉回归测试 (Visual Regression Testing)**。确保代码修改不会意外改变图表的像素级输出。

4.  **环境隔离 (Environment Isolation)**:
    *   使用 `renv` 锁定所有依赖包版本，确保 "Works on my machine" = "Works on server"。

## 4. 下一步行动 (Action Plan)

1.  初始化 R 包结构。
2.  编写 `theme_utils.R` 定义 NEJM 主题。
3.  开发第一个 MVP 模块：`plot_survival.R`。
