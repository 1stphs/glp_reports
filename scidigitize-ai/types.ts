import { RPlotStyleConfig } from './src/schemas/r_plot_schemas';

export type DetectionType = 'r_stat' | 'complex_table' | 'standard_chart' | 'infographic';

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

// --- 1. R-Grade Stats Data ---
export interface ExtractedRStatData {
  dataType: 'r_stat';
  chartType: 'survival' | 'forest' | 'waterfall' | 'nomogram' | 'group_comparison' | 'roc' | 'volcano' | 'swimmer' | 'sankey';
  style_config: RPlotStyleConfig;
  data_payload: any; // Flexible payload depending on chart type (e.g., array of objects)
  confidence: number;
  summary: string;
}

// --- 2. Standard Chart Data ---
export interface ExtractedChartData {
  dataType: 'chart'; // Legacy name 'chart' maps to 'standard_chart' detection
  title: string;
  chartType: 'scatter' | 'line' | 'bar';
  xAxisLabel: string;
  yAxisLabel: string;
  xAxisConfig?: AxisConfig;
  yAxisConfig?: AxisConfig;
  dataPoints: DataPoint[];
  referenceLines?: ChartReferenceLine[];
  annotations?: ChartAnnotation[];

  // High-Fidelity Style
  colors?: string[]; // Extracted hex codes for series
  aspectRatio?: number; // Width / Height ratio

  confidence: number;
  summary: string;
}

// --- 3. Table Data ---
export interface ExtractedTableData {
  dataType: 'table';
  title: string;
  headers: string[];
  rows: string[][]; // Simple cell text, row by row
  confidence: number;
  summary: string;
}

// --- 4. Infographic Data ---
export interface ExtractedInfographicData {
  dataType: 'infographic';
  title: string;
  topic: string; // e.g., "Molecular Pathway", "Flowchart", "Anatomy"
  keyPoints: string[]; // List of key takeaways
  detailedDescription: string; // Markdown supported description of the mechanism
  confidence: number;
}

export type ExtractedData = ExtractedRStatData | ExtractedChartData | ExtractedTableData | ExtractedInfographicData;

export interface DetectedItem {
  box_2d: [number, number, number, number];
  label: string;
  type: DetectionType;
  caption: string;
  reason: string; // Brief rationale for classification
}

export interface SubItem {
  id: string;
  type: DetectionType;
  reason?: string; // Classification rationale
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

  // Mineru Parsing State
  mineruStatus?: 'idle' | 'uploading' | 'processing' | 'done' | 'error';
  mineruBatchId?: string;
  mineruResultUrl?: string;
  mineruProgress?: {
    current: number;
    total: number;
  };
}

// --- Mineru API Types ---
export interface MineruFile {
  name: string;
  data_id?: string;
}

export interface MineruBatchRequest {
  files: MineruFile[];
  model_version: 'vlm' | 'pipeline';
}

export interface MineruBatchResponse {
  code: number;
  msg: string;
  data: {
    batch_id: string;
    file_urls: string[];
  };
}

export interface MineruExtractResult {
  file_name: string;
  state: 'done' | 'waiting-file' | 'pending' | 'running' | 'failed' | 'converting';
  err_msg?: string;
  full_zip_url?: string;
  extract_progress?: {
    extracted_pages: number;
    total_pages: number;
    start_time: string;
  };
  // Custom API additions
  images?: string[];
  full?: string; // Markdown URL
  layout?: string; // JSON URL
  origin?: string; // Original URL
  content_list?: string;
}

export interface MineruResultResponse {
  code: number;
  data: {
    batch_id: string;
    extract_result: MineruExtractResult[];
  };
}

