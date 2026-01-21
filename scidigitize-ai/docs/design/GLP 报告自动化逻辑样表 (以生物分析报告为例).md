### **GLP 报告自动化逻辑样表 (以生物分析报告为例)**

| 章节名称 (Chapter) | 数据契约 (Data Contract - 左脑提供) | 参考范例 (Reference Examples - 右脑学习) |
| --- | --- | --- |
| **1. 摘要 (Summary)** | `{ "StudyID": "IP-2026-001", "Analyte": "阿司匹林", "Matrix": "比格犬血浆", "LLOQ": "1.00 ng/mL", "ULOQ": "1000 ng/mL", "Regression": "1/x² 加权最小二乘法" }` | **范例 1**：本研究建立了[Matrix]中[Analyte]的测定方法。定量范围为[LLOQ]至[ULOQ]，采用[Regression]进行拟合。 |
| **2. 精密度与准确度 (P&A)** | `{ "IntraBatch_CV_Range": [2.1, 5.4], "IntraBatch_RE_Range": [-4.2, 3.8], "InterBatch_CV_Max": 4.8, "InterBatch_RE_Max": 3.2, "PassStatus": true }` | **范例 1**：批内精密度 (CV%) 在 [IntraBatch_CV_Range]% 之间，准确度 (RE%) 为 [IntraBatch_RE_Range]%。结果表明方法具有良好的精密度。<br>

<br>**范例 2**：所有质控样品的批间 CV% 均小于 [InterBatch_CV_Max]%，满足 GLP 指导原则要求。 |
| **3. 稳定性 (Stability)** | `{ "Condition": "室温放置", "Duration": "6小时", "Mean_Recovery": 98.5, "Stability_Result": "Stable" }` | **范例 1**：待测物在[Condition]条件下放置[Duration]后，平均回收率为[Mean_Recovery]%，证明在处理过程中保持稳定。 |