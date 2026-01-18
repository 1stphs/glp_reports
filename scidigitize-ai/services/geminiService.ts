import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedChartData, ExtractedTableData, ExtractedInfographicData } from "../types";

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
  type: 'chart' | 'table' | 'infographic';
  caption: string;
}

// 1. Discovery Phase
export const detectChartsInPage = async (base64Image: string): Promise<DetectedItem[]> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this scientific document page. Detect and classify distinct visual elements into three categories:
    1. 'chart': Quantitative plots (scatter, bar, line, box plots).
    2. 'table': Structured data grids with rows/columns.
    3. 'infographic': Qualitative diagrams, flowcharts, molecular structures, pathways, schematics, or photos.
    
    For each item, return:
    1. The bounding box (ymin, xmin, ymax, xmax) on a 0-1000 scale.
    2. A label (e.g., "Figure 1").
    3. The type.
    4. The associated caption text located near the image.
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
              type: { type: Type.STRING, enum: ["chart", "table", "infographic"] },
              caption: { type: Type.STRING, description: "The caption text found in the image" }
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

// 2a. Extraction: Charts
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
