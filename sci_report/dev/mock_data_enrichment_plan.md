# Mock Data Enrichment Plan for GLP-In-Silico

## 1. Objective
To enrich the `sci_report` application (specifically the **Standard Library** module) with high-fidelity mock data derived from real-world GLP documents provided in `original docs/docs_index.md`. This will ensure the "Demo Mode" and "Template Library" feel authentic to bioanalytical scientists.

## 2. Source Material Analysis
We have identified 4 distinct "Archetypes" of studies from the documentation index:

| Archetype ID | Type | Species | Drug / Matrix | Key Characteristic | Source Project |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TMPL-001** | Small Molecule | SD Rat | Abaloparatide | **Full Validation** (Selectivity, Matrix Effect, Stability) | `NS25318BV01` |
| **TMPL-002** | Oligonucleotide | Cynomolgus Monkey | FB7013 (Antisense) | **Long-Term Stability** Focus (100+ days) | `SS25071BV02` |
| **TMPL-003** | Small Molecule | Bama Minipig | 810Z00-T | **Large Animal** Model, Wide Range (50-25000 pg/mL) | `SS24050BV01` |
| **TMPL-004** | Oligonucleotide | Nude Mouse | Dxd (ADC Payload) | **Partial Validation** (Co-administered Drug A interaction) | `SS25255NM01` |

## 3. Implementation Strategy

### 3.1 Template List Enrichment (`TemplateListView.tsx`)
We will replace the generic mock templates with these 4 specific archetypes.

**Proposed Data Structure:**
```typescript
{
  id: "TMPL-001-RAT-SM-FULL",
  name: "Small Mol Full Validation (Rat) - Abaloparatide",
  version: "v2.0 (Final)",
  species: ["SD Rat"],
  matrix: "Plasma (K2-EDTA)",
  regulation: "NMPA/FDA",
  status: "Published",
  tags: ["Small Molecule", "LC-MS/MS", "Full Validation"],
  lastModified: "2025-12-26",
  author: "Yang Jiemin"
}
```

### 3.2 Chapter Backbone & Logic (`DataContractEditor.tsx`)
We will create distinct `JSON Schema` structures for each archetype to demonstrate the system's flexibility.

*   **Scenario A: Full Validation (TMPL-001)**
    *   **Chapters**: System Suitability, Selectivity, Matrix Effect, Linearity, Accuracy & Precision, Extraction Recovery, Stability (T0, FT, ST, LT).
    *   **Logic Rules**: `Accuracy within ±15%`, `Precision CV < 15%`, `LQC/HQC Deviation allowed`.

*   **Scenario B: Partial Validation (TMPL-004)**
    *   **Chapters**: System Suitability, Carryover, Linearity, Intra-batch A&P, Short-term Stability.
    *   **Logic Rules**: Highlighting *missing* chapters (e.g., "Long-term Stability not required for Partial Validation").

### 3.3 Few-Shot Examples (`FewShotManager.tsx`)
We will populate the "Right Brain" with 3-5 realistic text snippets for each template, derived from the document descriptions.

**Example for TMPL-001 (Rat/Small Mol):**
*   **Result (Normal)**: "The validated range for Abaloparatide in SD Rat plasma was **0.100 to 50.000 ng/mL**. The correlation coefficient (r²) of the calibration curves was greater than **0.99**."
*   **Method Robustness**: "Matrix effect assessments verified that endogenous plasma components followed by LC-MS/MS analysis did not significantly interfere with the quantification."
*   **Stability**: "Stability was demonstrated for **93 days** at -80°C, covering the duration of sample storage."

**Example for TMPL-002 (Monkey/Oligo):**
*   **Hyper-Stability**: "Long-term stability in Cynomolgus Monkey plasma was established for **103 days** at -70°C to -90°C."
*   **Specificity**: "No significant interference was observed at the retention times of **FB7013 antisense** or **sense strands** in blank plasma samples."


## 4. Automated Data Extraction (Scripting Strategy)
Since the `original docs/markdown_docs` directory contains detailed markdown files, we will implement a **Batch Extraction Script** to programmatically generate the mock data.

### 4.1 Script Logic (`scripts/extract_mock_templates.js`)
We will create a Node.js script to process all `.md` files in `original docs/`.

**Algorithm:**
1.  **Glob Search**: Find all `**/*.md` files in `original docs`.
2.  **Metadata Parsing**:
    *   **Study ID**: Extract from filename (e.g., `NS25318BV01`).
    *   **Species**: Regex match for `(Rat|Mouse|Monkey|Dog|Pig)`.
    *   **Matrix**: Regex match for `(Plasma|Serum|Urine)`.
    *   **Validation Type**: Detect keywords like `Validation Report`, `Protocol`, `Data Summary`.
3.  **Content Extraction**:
    *   **Abstract**: Extract the first `> Blockquote` as the template description/summary.
    *   **Few-Shot Candidates**: Extract paragraphs containing numbers and units (e.g., `\d+\.\d+ ng/mL`) to serve as narrative examples.
4.  **Output**: Generate `src/services/mock/auto_generated_templates.json`.

### 4.2 Benefits
*   **Scale**: Instantly generate 20+ templates from the file system.
*   **Realism**: Uses actual text description from the source documents.
*   **Maintainability**: Re-run the script if more docs are added.

## 5. Execution Steps
1.  **Develop Script**: Write `scripts/extract_mock_templates.js`.
2.  **Run Extraction**: Generate `src/services/mock/auto_generated_templates.json`.
3.  **Integrate**: Import this JSON into `TemplateListView.tsx` and merge with manual archetypes.
4.  **Verify**: Check that the "Asset Hub" is populated with diverse, real-world examples.
