export type ProcessingStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'error';

export interface DataPoint {
  x: number | string;
  y: number;
  series?: string;
  label?: string; // Specific label for this point if present (e.g., "Cmax")
}

export interface AxisConfig {
  min?: number;
  max?: number;
  scaleType?: 'linear' | 'log';
  unit?: string;
}

export interface ChartReferenceLine {
  axis: 'x' | 'y';
  value: number;
  label?: string;
  lineStyle?: 'dashed' | 'solid' | 'dotted';
  color?: string;
}

export interface ChartAnnotation {
  text: string;
  x: number | string;
  y: number;
  type: 'label' | 'significance' | 'arrow'; // significance for things like *** or p<0.05
}

export interface ExtractedChartData {
  dataType: 'chart';
  title: string;
  chartType: 'scatter' | 'line' | 'bar';
  xAxisLabel: string;
  yAxisLabel: string;
  xAxisConfig?: AxisConfig;
  yAxisConfig?: AxisConfig;
  dataPoints: DataPoint[];
  referenceLines?: ChartReferenceLine[]; // New: Horizontal/Vertical lines
  annotations?: ChartAnnotation[]; // New: Text floating on the chart
  confidence: number;
  summary: string;
}

export interface ExtractedTableData {
  dataType: 'table';
  title: string;
  headers: string[];
  rows: string[][]; // Simple cell text, row by row
  confidence: number;
  summary: string;
}

export interface ExtractedInfographicData {
  dataType: 'infographic';
  title: string;
  topic: string; // e.g., "Molecular Pathway", "Flowchart", "Anatomy"
  keyPoints: string[]; // List of key takeaways
  detailedDescription: string; // Markdown supported description of the mechanism
  confidence: number;
}

export type ExtractedData = ExtractedChartData | ExtractedTableData | ExtractedInfographicData;

export interface SubItem {
  id: string;
  type: 'chart' | 'table' | 'infographic'; // Detected type
  file: File;
  previewUrl: string;
  context: string; // Combined specific caption + full page text
  pageNumber: number; // Track location
  status: ProcessingStatus;
  result?: ExtractedData;
  errorMessage?: string;
}

export interface FileItem {
  id: string;
  type: 'image' | 'pdf';
  file: File;
  previewUrl: string; 
  status: ProcessingStatus | 'scanning'; 
  result?: ExtractedData; 
  errorMessage?: string;
  timestamp: number;
  context?: string; 
  
  // PDF Specific
  globalContext?: string; // Title, Abstract, or first page text
  subItems?: SubItem[]; 
}
