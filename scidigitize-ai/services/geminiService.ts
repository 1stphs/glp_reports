import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedChartData, ExtractedTableData, ExtractedInfographicData, ExtractedRStatData, DetectionType } from "../types";

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface DetectedItem {
  box_2d: [number, number, number, number];
  label: string;
  type: DetectionType;
  caption: string;
}

// 1. Discovery Phase (Updated for 4-Tier)
export const detectChartsInPage = async (base64Image: string): Promise<DetectedItem[]> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analyze this scientific document page. Detect and classify distinct visual elements into these 4 STRICT categories.
    
    CRITICAL RULE: If a chart contains Statistical Annotations (P-values, HR, Confidence Intervals) or Medical specific contexts (Bio-analysis, Clinical Trials), it MUST be classified as 'r_stat'. Do NOT classify these as 'standard_chart'.

    1. 'r_stat' (Red Tier): High-value medical/statistical charts requiring 1:1 reconstruction.
       - INCLUDES: 
          * Survival Curves (Kaplan-Meier): Look for step-like lines, "No. at risk" tables below X-axis, "+" marks for censoring.
          * Forest Plots: Look for vertical reference lines, odds ratios/hazard ratios text columns.
          * Waterfall Plots: Ordered bar charts (mutation/response).
          * Nomograms: Complex scales and points axes.
          * Volcano/Swimmer/Sankey/ROC.
       - KEYWORDS: "HR", "P<", "CI", "Months", "Survival", "Response".
    
    2. 'complex_table' (Blue Tier): Dense clinical tables.
       - INCLUDES: Baseline Characteristics (Table 1), AE Summaries, PK Parameter tables.
       - LOOK FOR: Nested headers, indentation, extensive abbreviations, "n (%)".
       
    3. 'standard_chart' (Yellow Tier): Basic quantitative plots WITHOUT medical stats.
       - INCLUDES: Simple Bar charts, Line charts, Scatter plots showing basic raw data trends (e.g. "Body Weight over time" without complex stats).
       - Exclude if it has a Risk Table or P-value -> Move to r_stat.
       
    4. 'infographic' (Green Tier): Qualitative diagrams.
       - INCLUDES: Pathways, Molecular structures, Flowcharts, Photos, Schematics.
    
    For each item, return:
    1. The bounding box [ymin, xmin, ymax, xmax] (0-1000 scale).
    2. A label (e.g., "Figure 1A").
    3. The type (r_stat, complex_table, standard_chart, infographic).
    4. The associated caption.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              box_2d: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER },
                description: "Bounding box [ymin, xmin, ymax, xmax] on 0-1000 scale"
              },
              label: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["r_stat", "complex_table", "standard_chart", "infographic"] },
              caption: { type: Type.STRING, description: "The caption text" }
            },
            required: ["box_2d", "label", "type", "caption"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (e) {
    console.error("Detection failed", e);
    return [];
  }
};

// 2a. Extraction: R-Grade Statistics (Configuration over Code)
export const analyzeRStatImage = async (file: File, contextText?: string, globalContext?: string): Promise<ExtractedRStatData> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = await fileToGenerativePart(file);

  const globalCtx = globalContext ? `\nGLOBAL PAPER CONTEXT: "${globalContext}"` : "";
  const localCtx = contextText ? `\nLOCAL CAPTION: "${contextText}"` : "";

  const prompt = `
    You are a Senior Bio-Statistician. Your goal is to digitize this medical chart into a Configuration Object for an R Template Engine.
    
    CONTEXT:
    ${globalCtx}
    ${localCtx}
    
    TASK:
    1. Identify the 'chartType' from this list: 'survival', 'forest', 'waterfall', 'nomogram', 'group_comparison', 'roc', 'volcano', 'swimmer', 'sankey'.
    2. Extract the 'style_config' (Visual Design Tokens). Focus on:
       - journal_theme (NEJM/LANCET/NATURE style?)
       - colors (palette)
       - specific toggles (risk_table? p-values? confidence intervals?)
    3. Extract the 'data_payload' (The Data). 
       - Reconstruct the dataset needed to re-plot this. 
       - For Survival: time, status, strata.
       - For Forest: variable, estimate, low, high, p_val.
       - For Volcano: log2FC, p_value, gene_symbol.
       
    OUTPUT JSON conforming to the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-pro-exp-02-05",
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 4096 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dataType: { type: Type.STRING, enum: ["r_stat"] },
            chartType: { type: Type.STRING, enum: ["survival", "forest", "waterfall", "nomogram", "group_comparison", "roc", "volcano", "swimmer", "sankey"] },
            style_config: { type: Type.OBJECT, description: "Style configuration matching RPlotStyleConfig" },
            data_payload: { type: Type.OBJECT, description: "Raw data array or object" },
            confidence: { type: Type.NUMBER },
            summary: { type: Type.STRING }
          },
          required: ["dataType", "chartType", "style_config", "data_payload", "confidence"]
        }
      }
    });

    if (!response.text) throw new Error("No response");
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini R-Stat Error:", error);
    throw error;
  }
};

// 2b. Extraction: Standard Charts (Legacy)
export const analyzeChartImage = async (file: File, contextText?: string, globalContext?: string): Promise<ExtractedChartData> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = await fileToGenerativePart(file);

  const globalCtx = globalContext ? `\nGLOBAL PAPER CONTEXT (Title/Abstract):\n"${globalContext}"` : "";
  const localCtx = contextText ? `\nLOCAL PAGE CONTEXT (Caption & Surrounding Text):\n"${contextText}"` : "";

  const prompt = `
    Analyze the provided scientific chart with HIGH PRECISION.
    
    CONTEXT INFORMATION:
    ${globalCtx}
    ${localCtx}
    
    INSTRUCTIONS:
    1. **Data Extraction**: Reconstruct the X/Y dataset. If points have specific text labels (e.g. "Control", "Treated"), extract them.
    2. **Auxiliary Elements (CRITICAL)**: 
       - Identify REFERENCE LINES (e.g., "Limit of Detection", "Baseline", dashed lines).
       - Identify ANNOTATIONS (e.g., "p < 0.05", "***", "Max Value", arrows pointing to specific areas).
       - Identify the exact visual style of lines (dashed vs solid).
    3. **Axis Calibration**: Use the local context to determine the exact unit and scale (linear vs log).

    Output the result in the specified JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 4096 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dataType: { type: Type.STRING, enum: ["chart"] },
            title: { type: Type.STRING },
            chartType: { type: Type.STRING, enum: ["scatter", "line", "bar"] },
            xAxisLabel: { type: Type.STRING },
            yAxisLabel: { type: Type.STRING },
            xAxisConfig: {
              type: Type.OBJECT,
              properties: {
                min: { type: Type.NUMBER }, max: { type: Type.NUMBER },
                scaleType: { type: Type.STRING, enum: ["linear", "log"] }, unit: { type: Type.STRING }
              }, nullable: true
            },
            yAxisConfig: {
              type: Type.OBJECT,
              properties: {
                min: { type: Type.NUMBER }, max: { type: Type.NUMBER },
                scaleType: { type: Type.STRING, enum: ["linear", "log"] }, unit: { type: Type.STRING }
              }, nullable: true
            },
            referenceLines: {
              type: Type.ARRAY,
              description: "Horizontal or vertical lines drawn on the chart for reference",
              items: {
                type: Type.OBJECT,
                properties: {
                  axis: { type: Type.STRING, enum: ["x", "y"] },
                  value: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                  lineStyle: { type: Type.STRING, enum: ["dashed", "solid", "dotted"] }
                },
                required: ["axis", "value"]
              },
              nullable: true
            },
            annotations: {
              type: Type.ARRAY,
              description: "Floating text, significance stars, or labels pointing to specific coordinates",
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  x: { type: Type.NUMBER, description: "X coordinate of the annotation" },
                  y: { type: Type.NUMBER, description: "Y coordinate of the annotation" },
                  type: { type: Type.STRING, enum: ["label", "significance", "arrow"] }
                },
                required: ["text", "x", "y", "type"]
              },
              nullable: true
            },
            confidence: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            dataPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.STRING },
                  y: { type: Type.NUMBER },
                  series: { type: Type.STRING, nullable: true },
                  label: { type: Type.STRING, nullable: true, description: "Specific label for this point if text is near it" }
                }, required: ["x", "y"]
              }
            }
          },
          required: ["dataType", "title", "chartType", "dataPoints", "confidence"]
        }
      }
    });

    if (!response.text) throw new Error("No response");
    const result = JSON.parse(response.text);
    const processedPoints = result.dataPoints.map((p: any) => {
      const numX = parseFloat(p.x);
      return { ...p, x: !isNaN(numX) && p.x.trim() !== "" && !p.x.match(/[a-zA-Z]/) ? numX : p.x };
    });

    // Post-process annotations to match X type if needed (currently schema enforces number for simplicity, 
    // but in a full app we'd handle categorical X for annotations too. For now assume chart coords).

    return { ...result, dataType: 'chart', dataPoints: processedPoints };
  } catch (error) {
    console.error("Gemini Chart Error:", error);
    throw error;
  }
};

// 2b. Extraction: Complex Tables
export const analyzeTableImage = async (file: File, contextText?: string, globalContext?: string): Promise<ExtractedTableData> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = await fileToGenerativePart(file);

  const globalCtx = globalContext ? `\nGLOBAL PAPER CONTEXT (Title/Abstract):\n"${globalContext}"` : "";
  const localCtx = contextText ? `\nLOCAL PAGE CONTEXT (Caption & Surrounding Text):\n"${contextText}"` : "";

  // Optimized prompt for complex tables
  const prompt = `
    Extract structured data from this table image.
    ${globalCtx}
    ${localCtx}

    HANDLING COMPLEX TABLES:
    - Use context to expand abbreviations in headers.
    - If the table has merged headers or sub-headers, try to flatten them into a single descriptive header row.
    - Ensure row alignment is preserved.
    - Treat empty cells as empty strings.
    
    Output JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 4096 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dataType: { type: Type.STRING, enum: ["table"] },
            title: { type: Type.STRING },
            headers: { type: Type.ARRAY, items: { type: Type.STRING } },
            rows: {
              type: Type.ARRAY,
              items: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            confidence: { type: Type.NUMBER },
            summary: { type: Type.STRING }
          },
          required: ["dataType", "title", "headers", "rows", "confidence"]
        }
      }
    });

    if (!response.text) throw new Error("No response");
    const result = JSON.parse(response.text);
    return { ...result, dataType: 'table' };
  } catch (error) {
    console.error("Gemini Table Error:", error);
    throw error;
  }
};

// 2c. Extraction: Infographics
export const analyzeInfographicImage = async (file: File, contextText?: string, globalContext?: string): Promise<ExtractedInfographicData> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = await fileToGenerativePart(file);

  const globalCtx = globalContext ? `\nGLOBAL PAPER CONTEXT (Title/Abstract):\n"${globalContext}"` : "";
  const localCtx = contextText ? `\nLOCAL PAGE CONTEXT (Caption & Surrounding Text):\n"${contextText}"` : "";

  const prompt = `
    Analyze this scientific infographic / diagram.
    ${globalCtx}
    ${localCtx}
    
    Your goal is to explain the MECHANISM, PROCESS, or STRUCTURE depicted.
    - Do not try to extract X/Y data points.
    - Focus on arrows, labels, flow, and relationships between elements.
    - Use the context to properly name proteins, molecules, or steps.
    - Provide a detailed Markdown description.
    
    Output JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 4096 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dataType: { type: Type.STRING, enum: ["infographic"] },
            title: { type: Type.STRING },
            topic: { type: Type.STRING, description: "e.g. Signal Pathway, Experimental Setup" },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-5 main takeaways" },
            detailedDescription: { type: Type.STRING, description: "Full explanation in Markdown" },
            confidence: { type: Type.NUMBER }
          },
          required: ["dataType", "title", "topic", "keyPoints", "detailedDescription", "confidence"]
        }
      }
    });

    if (!response.text) throw new Error("No response");
    const result = JSON.parse(response.text);
    return { ...result, dataType: 'infographic' };
  } catch (error) {
    console.error("Gemini Infographic Error:", error);
    throw error;
  }
};
