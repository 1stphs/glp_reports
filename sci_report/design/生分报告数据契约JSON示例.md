# GLP-BioAnalyst：精密度与准确度数据契约 (JSON)

本契约定义了从 P2 (逻辑左脑) 传递给 P3 (叙述右脑) 的标准数据结构。

**核心更新**：增加了 `excluded_points` 字段，用于记录在实验过程中因技术原因被剔除的数据点及其理由，满足 FDA 对“数据剔除”的严格审计要求。

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
      },
      "excluded_points": [
        {
          "sample_id": "LQC-03",
          "nominal_conc": 3.00,
          "observed_conc": 0.5,
          "reason_code": "ERR_TECHNICAL_01",
          "reason_desc": "Samplespill during processing (技术性操作失误：样本溅出)",
          "approved_by": "SD_John_Doe",
          "timestamp": "2026-01-15T14:22:11Z"
        }
      ]
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

1.  **Analytical Runs & QC Results**:
    *   **左脑职责**：计算结果严禁 LLM 参与，全部由 Python 脚本在沙箱计算。

2.  **Excluded Points (数据剔除 - 新增)**:
    *   **GLP 关键合规点**：任何未参与统计的数据必须列出，记录 `reason_desc`（剔除理由）和 `approved_by`（批准人）。
    *   **右脑指令**：生成报告时，LLM 必须读取此字段，并在文稿中生成类似句式：“*Run-01 中，样本 LQC-03 因样本溅出作为异常值剔除，未纳入统计。*”

3.  **Inter-batch Summary**:
    *   **Regulatory Standard**：明确本次判定依据的法规版本（如 2026 版指南），确保合规依据的时效性。
