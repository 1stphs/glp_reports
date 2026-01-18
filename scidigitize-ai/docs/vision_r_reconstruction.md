# 愿景：基于 R 生态标准的医学图表 1:1 复原 (Configuration over Code)

> **核心理念**: **不要让 AI 盲目写代码 (Don't let AI write raw code)**。
> 我们采用 **“AI 提取参数 + 标准化 R 模板”** 的工程化路径，确保生成的图表既符合“顶刊审美”，又具备 GLP 级别的可重复性与合规性。

## 1. 核心架构：配置驱动生成 (Configuration-Driven Generation)

我们的目标不是让 LLM 当程序员，而是让它当“审美顾问”和“数据录入员”。

### Step 1: 视觉感知与参数提取 (Gemini Vision)
LLM 扮演“解析器”的角色，它不生成 R 代码，而是分析目标图片，输出一个严格定义的 **JSON 配置对象 (Style Schema)**。

**Input**: 用户上传的一张 *Nature Medicine* 风格的生存曲线截图。
**AI Output (JSON)**:
```json
{
  "chart_type": "surv_curve",
  "style_config": {
    "journal_theme": "NEJM",  // 预设主题：NEJM, Lancet, JCO
    "palette": ["#B24745", "#374E55"], // 提取出的主色调
    "font_family": "Arial",
    "risk_table": {
      "show": true,
      "align": "stretch",
      "font_size": 10
    },
    "censoring_mark": "+", // 删失点形状
    "legend_position": "top-right",
    "p_value_annotation": {
      "show": true,
      "method": "log-rank",
      "format": "P < 0.001"
    }
  },
  "data_payload": { ... } // 纯数据部分
}
```

### Step 2: 标准化 R 模板引擎 (The R Template Engine)
我们在后端预置几十套经过严格验证的 R 函数 (Standardized Functions)。这些函数封装了 `survminer`, `forestplot` 等包的复杂细节，只接受 JSON 参数。

**R Backend Logic**:
```r
# 预置的标准化绘图函数
draw_survival_plot <- function(json_config) {
  # 1. 载入数据
  data <- load_json_data(json_config$data_payload)
  
  # 2. 应用主题 (Design Tokens)
  theme <- get_journal_theme(json_config$style_config$journal_theme)
  
  # 3. 调用 survminer (黄金标准)
  ggsurvplot(
    fit, 
    data = data, 
    palette = json_config$style_config$palette,
    risk.table = json_config$style_config$risk_table$show,
    ggtheme = theme_pubr(base_family = json_config$style_config$font_family),
    ...
  )
}
```

### Step 3: 确定性交付 (Deterministic Delivery)
*   **零语法错误**: 因为代码是预写好的，不存在 AI 幻觉导致的语法错误。
*   **样式统一**: 无论是谁上传，输出的图表都严格符合 NEJM/Lancet 等预设标准。
*   **可溯源**: 每一个生成的图表背后都有一个确定的 JSON 配置文件，方便审计。

## 2. 为什么选择这条路？ (Why Configuration?)

| 维度 | AI 直接写 R 代码 | AI 提取参数 + R 模板 (本项目方案) |
| :--- | :--- | :--- |
| **稳定性** | 差，代码经常报错，依赖包版本冲突 | **极高**，调用的是封装好的内部函数库 |
| **复现性** | 低，每次生成的代码可能不同 | **100%**，相同的 JSON 必生成相同的图 |
| **合规性** | 难以审计，代码可能是黑盒 | **Gold Standard**，逻辑完全透明受控 |
| **审美上限** | 依赖 AI 的随机发挥 | **顶刊级**，由人类专家打磨好的模板兜底 |

## 3. 覆盖场景与 R 生态映射

### A. 生存分析 (Survival Analysis)
*   **核心包**: `survminer` + `survival`
*   **可配置参数**: 风险表 (Risk Table) 的行高、P值显示的位置、置信区间的透明度、删失点的形状。
*   **模板库**: 
    *   `Theme_NEJM`: 极简红蓝配色，右上角 Legend。
    *   `Theme_Lancet`: 经典黄蓝配色，底部 Legend。

### B. 森林图 (Forest Plots)
*   **核心包**: `forestploter`
*   **可配置参数**: 效应值 (HR/OR) 列的位置、置信区间线段的粗细、无效线 (Ref Line) 的样式、斑马纹背景。
*   **场景**: 亚组分析专用模板，自动对齐文本列与图形列。

### C. 瀑布图 & 泳道图 (Oncology)
*   **核心包**: `maftools` / `ggplot2`
*   **可配置参数**: 突变类型的颜色映射 (e.g., Missense=Green, Nonsense=Black)、排序规则 (Mutational Burden vs Response)。

## 4. 实施路线 (Next Steps)

1.  **构建模板库 (Template Library)**: 资深 R 语言专家编写 `templates.R`，封装好 10-20 个高频绘图函数。
2.  **定义 Schema**: 确定 JSON 配置文件的结构规范 (JSON Schema)。
3.  **Prompt Engineering**: 训练 Gemini Vision 能够准确识别目标图片的视觉特征，并映射到上述 Schema 中。
