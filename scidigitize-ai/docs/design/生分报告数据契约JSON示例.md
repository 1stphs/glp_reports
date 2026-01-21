### **GLP-BioAnalyst：精密度与准确度数据契约 (JSON)**

```json
{
  "chapter_metadata": {
    "chapter_id": "CH_2_PRECISION_ACCURACY",
    "study_id": "FOXU-2026-BIO-001",
    "analyte_name": "Compound X",
    "matrix": "Beagle Dog Plasma",
    "calculation_engine": "Firecracker-Py-3.10-v1.2",
    "timestamp": "2026-01-21T20:30:00Z"
  },
  "analytical_runs": [
    {
      "run_id": "RUN-01",
      "analysis_date": "2026-01-15",
      "status": "Accepted",
      "qc_results": {
        "LLOQ": { "nominal_conc": 1.00, "mean_observed": 1.02, "precision_cv": 4.2, "accuracy_re": 2.0, "n": 6 },
        "LQC": { "nominal_conc": 3.00, "mean_observed": 2.95, "precision_cv": 3.1, "accuracy_re": -1.7, "n": 6 },
        "MQC": { "nominal_conc": 400.0, "mean_observed": 412.0, "precision_cv": 2.5, "accuracy_re": 3.0, "n": 6 },
        "HQC": { "nominal_conc": 800.0, "mean_observed": 785.0, "precision_cv": 1.8, "accuracy_re": -1.9, "n": 6 }
      }
    }
  ],
  "inter_batch_summary": {
    "precision_range_cv": [1.8, 4.2],
    "accuracy_range_re": [-1.9, 3.0],
    "is_compliant": true,
    "regulatory_standard": "NMPA/FDA BMV Guidelines 2026"
  },
  "audit_trail": {
    "source_files": [
      { "file_name": "raw_data_batch_01.xlsx", "hash": "sha256:e3b0c442...", "range": "Sheet1!B2:G20" }
    ],
    "logic_checksum": "logic_v5.4_stable"
  }
}

```

---

### **契约字段解析 (Logic Breakdown)**

1. **Chapter Metadata (章节元数据)**:
* 明确了计算的环境（Firecracker 沙箱版本）和时间戳，确保计算过程可复现且满足全溯源（Full Traceability）要求。


2. **Analytical Runs (分析批次数据)**:
* **左脑职责**：从原始 Excel 中提取每个批次的原始值，计算平均值（Mean）、精密度（CV%）和准确度（RE%）。
* **确定性保证**：此处严禁 LLM 参与，所有数字由 Python 脚本计算得出，确保“零缺陷”（Zero Defect）。


3. **Inter-batch Summary (批间汇总与判定)**:
* **逻辑分流**：系统内置了 NMPA/FDA 的标准（如 LLOQ 偏差需在  以内，其他在  以内）。
* **`is_compliant` 标记**：这是给右脑的“指令旗帜”。如果为 `true`，右脑会选择“符合要求”的范例段落进行润色；如果为 `false`，则触发预警。


4. **Audit Trail (审计追踪/血缘地图)**:
* 记录了该 JSON 数据的“前世今生”，包括原始文件的 Hash 值和具体的 Excel 单元格范围。
* 在双栏预览界面，用户点击报告中的任何数字，系统都会通过这些 Hash 标记定位到右侧的证据列。
