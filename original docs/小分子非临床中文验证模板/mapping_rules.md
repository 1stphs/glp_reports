# Protocol-Data-Report Mapping Rules

## Executive Summary
This document analyzes how to automate the generation of **Biological Analysis Verification Reports** (Final Report) by combining a **Verification Protocol** (Word) with **Experimental Data** (Excel).
The analysis is based on two pilot studies: `NS25318BV01` and `SS25071BV01`.

## 1. The Core Logic
The Final Report is essentially the Protocol with added **Results** sections. The Data for these results comes from Excel files.
-   **Structure Source**: `Protocol.docx` (provides the skeleton).
-   **Content Source**: `Data/` (Excel files provide the tables).
-   **Linking Key**: The **Table Title** (e.g., "表2：系统适用性") found inside the Excel files is the universal key.

## 2. File Naming vs. Content Matching
> [!IMPORTANT]
> **Do not rely on Excel filenames.**
-   Study 1 (`NS...`) uses Chinese filenames: `表2_系统适用性.xlsx`
-   Study 2 (`SS...`) uses English abbreviations: `表2_SST.xlsx`
-   **Consistency**: Both files start with "表2" and contain "表2：系统适用性" in Cell A1.

**Rule**: Always open the Excel file and read the first non-empty cell to determine the Table Identity.

## 3. Structural Mapping

| Report Section | Source Type | Source Location | Logic |
| :--- | :--- | :--- | :--- |
| **Cover Page** | Protocol | Cover Page | Copy direct, change "Protocol" to "Report", add Report No. |
| **1. Introduction** (Purpose, Sponsor, etc.) | Protocol | Heading 2 Sections | Direct Copy (Static). |
| **2. Experimental Method** | Protocol | Body Text | Direct Copy (Static). |
| **3. Results** | **Excel** | **Dynamic** | **See Section 4 below.** |
| **4. Conclusions** | New | - | Text generation required (Summary of results). |
| **5. Tables** (Appendix) | **Excel** | **Dynamic** | Insert full tables from Excel. |
| **6. Figures** | Images | Subfolder/Excel | Insert chromatograms (often images pasted in Excel or separate files). |

## 4. Detailed Data Tracing (The "Result" Sections)

### 4.1. System Suitability (系统适用性)
-   **Report Section**: `3.1 系统适用性` & `附表 表2 系统适用性`
-   **Excel Key**: Starts with `表2`
-   **Data Points Needed**:
    -   CV% of Retention Time (RT)
    -   CV% of Peak Area
    -   *Logic*: If CV < Guided Limit (usually 5% or 15%), pass.

### 4.2. Specificity/Selectivity (特异性/选择性)
-   **Report Section**: `3.2 选择性` / `3.3 特异性`
-   **Excel Key**: Starts with `表4` (Selectivity) or `表5` (Specificity)
-   **Data Points Needed**:
    -   Interference ratios (Blank vs LLOQ).
    -   *Logic*: Must be < 20% for analyte, < 5% for Internal Standard (IS).

### 4.3. Standard Curve (标准曲线)
-   **Report Section**: `3.5 标准曲线及范围`
-   **Excel Key**: Starts with `表7` (Regression) and `表8` (Curve Data)
-   **Data Points Needed**:
    -   Regression Equation (Slope, Intercept).
    -   Correlation Coefficient ($r^2$ or $r$).
    -   Back-calculated concentrations of Standards.

### 4.4. Accuracy & Precision (准确度及精密度)
-   **Report Section**: `3.6 批内/批间准确度及精密度`
-   **Excel Key**: Starts with `表9` (Intra/Inter QC)
-   **Data Points Needed**:
    -   Mean, SD, CV, Bias for LLOQ, LQC, MQC, HQC levels.
    -   *Logic*: Bias within ±15% (±20% for LLOQ).

### 4.5. Stability (稳定性)
-   **Report Section**: `3.10 稳定性` (and following subsections)
-   **Excel Key**:
    -   Start with `表14`/`表16`: Stock Solution Stability (Short/Long term).
    -   Start with `表19`: Freeze-thaw (冻融).
    -   Start with `表20`/`表21`: Matrix Stability (Benchtop/Long-term).

## 5. Automation Strategy
To build the `Report Generator`:
1.  **Ingest Protocol**: Parse `Protocol.docx` to build the document tree.
2.  **Scan Data**: Iterate recursively through the data folder.
    -   Open every `.xlsx`.
    -   Read Cell A1 to identify the table (e.g., "表11").
    -   Store in a `DataMap`: `{"表11": DataFrame}`.
3.  **Synthesize Results**:
    -   For each defined Result Section (e.g., Accuracy), look up the corresponding Table in `DataMap`.
    -   Calculate summary statistics (Mean, CV) if not already explicitly in a "Summary" row in Excel.
    -   Generate text: *"The intra-batch accuracy raged from [Min]% to [Max]%..."*.
4.  **Append Tables**:
    -   Iterate through `DataMap` keys sorted by number (Table 1, Table 2...).
    -   Format each DataFrame as a Word Table and append to the document.

