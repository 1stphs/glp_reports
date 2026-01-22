# 🧬 SciDigitize AI
> **Transforming Scientific Papers into Computable Data**

SciDigitize AI is a specialized tool designed to assist researchers in extracting, digitizing, and analyzing visual data from scientific PDF documents. 

It solves the "Unstructured Data" problem in GLP/Clinical research by using Multimodal AI to unlock insights trapped in charts, tables, and diagrams.

## 🚀 Core Functionality

### 1. **Perception & Discovery**
- **Full PDF Parsing**: Drag & drop any scientific PDF. The system automatically scans every page.
- **Visual Object Detection**: Uses **Gemini 2.5 Flash** to identify and classify visual elements into three distinct tiers to avoid misclassification:
    - 🔴 **R-Grade Medical Stats**: Charts that require **1:1 Reconstruction** (e.g., Survival Curves, Forest Plots, Waterfall Plots). *Action: Flag for R Code Generation.*
    - � **Complex Tables**: Nested headers, Baseline Characteristics, AE Summary tables. *Action: Structure Preservation & JSON Extraction.*
    - �🟡 **Standard Data Viz**: Simple quantitative plots (Bar, Line, Scatter). *Action: Standard Digitization via Recharts.*
    - 🟢 **Infographics**: Diagrams, molecular pathways, or photos. *Action: Context Extraction Only (No Reconstruction).*
- **Context Extraction**: Captures the "Global Context" (Title/Abstract) and "Local Context" (Figure Captions) to inform the analysis engine.

### 2. **Intelligent Extraction (Digitization)**
Once elements are detected, specialized AI Agents (powered by **Gemini 2.0 Pro**) digitize them:
- **Chart-to-Data**: Reconstructs the underlying `(X, Y)` raw data points from static images, recognizes reference lines, and identifies statistical annotations (p-values).
- **Table-to-JSON**: Transcribes complex biological tables into machine-readable JSON formats, handling merged headers and abbreviations intelligently.
- **Diagram Interpretation**: Generates detailed textual descriptions and key takeaways for qualitative infographics.

### 3. **Verification & Interactive Re-plotting**
- **Side-by-Side Comparison**: Users can verify the extracted data against the original image.
- **Interactive Visualization**: Automatically re-renders digitized data using **Recharts**, allowing users to inspect individual data points that were previously just pixels.

## 🔮 Future Roadmap: The R Ecosystem Standard

We are expanding our vision to achieve **1:1 pixel-perfect reconstruction** of complex medical statistics charts. By leveraging the **R Ecosystem** (the "Gold Standard" in medical stats), we aim to support:

*   **Survival Analysis**: Kaplan-Meier (`survminer`)
*   **Forest Plots**: Meta-analysis (`forestplot`)
*   **Waterfall Plots**: Oncology (`maftools`)
*   **Nomograms**: Clinical Prediction (`rms`)

👉 **[Read the Full Vision for Medical Chart Reconstruction](docs/vision_r_reconstruction.md)**

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 📊 R 语言服务配置 (R-Backend Setup)

为了启用高保真统计图表重构功能（R-Stat High-Fidelity Reconstruction），您需要在本地运行 R 后端服务。

### 1. 安装 R 环境 (MacOS)
```bash
brew install --cask r
```

### 2. 安装依赖包
在终端执行以下命令，自动安装 `plumber`, `ggplot2`, `survminer` 等核心库：
```bash
R -e "install.packages(c('plumber', 'ggplot2', 'survminer', 'survival', 'jsonlite'), repos='http://cran.rstudio.com/')"
```

### 3. 启动 R 服务
进入项目根目录后运行：
```bash
R -e 'plumber::plumb("r_templates/server.R")$run(port=8000)'
```
*服务启动后将监听 8000 端口，前端即可自动调用绘制功能。*

## 🛠 Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Model**: [Google Gemini Pro Vision](https://deepmind.google/technologies/gemini/) (via `@google/genai`)
- **PDF Processing**: [PDF.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`) - For rendering and text extraction
- **Visualization**: [Recharts](https://recharts.org/) - For rendering digitized charts
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## ✨ Key Features

- **Smart PDF Scanning**: Automatically parses multi-page PDFs, extracts global text context (e.g., abstract/introduction), and renders pages for visual analysis.
- **Visual Element Detection**: Auto-detects charts, tables, and infographics within documents using computer vision techniques.
- **AI-Powered Digitization**: Leverages Gemini Multimodal API to:
    -Convert static chart images into raw data (JSON) and re-plot them interactively using Recharts.
    - Transcribe complex tables into structured formats.
    - Summarize infographics with context awareness.
- **Context-Aware Analysis**: Combines local (page-level) and global (document-level) text context to improve AI analysis accuracy.
