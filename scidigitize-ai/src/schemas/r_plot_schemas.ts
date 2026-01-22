export type JournalTheme = 'NEJM' | 'LANCET' | 'NATURE' | 'JCO' | 'Simple';

export interface BaseStyleConfig {
    journal_theme: JournalTheme;
    palette?: string[]; // Standard palette Name (e.g. "nejm")
    custom_palette?: string[]; // Explicit Hex Codes (e.g. ["#FF0000", "#00FF00"])
    font_family?: string;
    legend_position?: 'top' | 'bottom' | 'right' | 'none';
    aspect_ratio?: number; // e.g. 1.6 for wide, 0.8 for tall
    break_time_by?: number;
    text_annotations?: Array<{
        text: string;
        x: number;
        y: number;
        size?: number;
    }>;
    reference_lines?: Array<{
        axis: 'x' | 'y';
        value: number;
        color?: string;
        linetype?: 'dashed' | 'dotted' | 'solid';
    }>;
}

// --- Module 1: Survival ---
export interface SurvivalStyleConfig extends BaseStyleConfig {
    risk_table: {
        show: boolean;
        height?: number; // 0-1, e.g. 0.25
        y_text?: boolean;
    };
    p_value_annotation: {
        show: boolean;
        coord?: [number, number];
        method?: boolean;
    };
    censoring_mark?: '+' | '|';
    conf_int_style?: 'ribbon' | 'step' | 'none';
}

// --- Module 2: Forest ---
export interface ForestStyleConfig extends BaseStyleConfig {
    ref_line?: number;
    ci_pch?: number; // 15=square, 18=diamond
    ci_style: 'T-bar' | 'diamond' | 'simple';
    zebra_stripe?: boolean;
}

// --- Module 3: Waterfall ---
export interface WaterfallStyleConfig extends BaseStyleConfig {
    sort_direction: 'asc' | 'desc';
    color_map?: Record<string, string>; // e.g., {'Missense': 'green'}
    show_annotation_tracks?: boolean;
}

// --- Module 4: Nomogram ---
export interface NomogramStyleConfig extends BaseStyleConfig {
    show_points_axis?: boolean;
    probability_levels?: number[]; // e.g. [3, 5] year survival
}

// --- Module 5: Group Comparison ---
export interface GroupComparisonStyleConfig extends BaseStyleConfig {
    type: 'boxplot' | 'violin' | 'barplot';
    stat_method: 't.test' | 'wilcox.test' | 'anova' | 'kruskal.test';
    add_jitter: boolean;
    p_label_format: 'p.format' | 'p.signif';
}

// --- Module 6: Diagnostic (ROC) ---
export interface DiagnosticStyleConfig extends BaseStyleConfig {
    smooth: boolean;
    show_auc: boolean;
    optimal_cutpoint: boolean;
}

// --- Module 7: Omics (Volcano) ---
export interface OmicsStyleConfig extends BaseStyleConfig {
    p_cutoff: number;
    fc_cutoff: number;
    label_top_n?: number;
}

// --- Module 8: Swimmer ---
export interface SwimmerStyleConfig extends BaseStyleConfig {
    sort_by_duration: boolean;
    show_events: boolean;
}

// --- Module 9: Flow (Sankey) ---
export interface FlowStyleConfig extends BaseStyleConfig {
    flow_type: 'sankey' | 'alluvial';
}

// Union Type
export type RPlotStyleConfig =
    | SurvivalStyleConfig
    | ForestStyleConfig
    | WaterfallStyleConfig
    | NomogramStyleConfig
    | GroupComparisonStyleConfig
    | DiagnosticStyleConfig
    | OmicsStyleConfig
    | SwimmerStyleConfig
    | FlowStyleConfig;
