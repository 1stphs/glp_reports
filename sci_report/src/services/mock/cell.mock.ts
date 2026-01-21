
export interface QCResult {
    nominal_conc: number;
    mean_observed: number;
    precision_cv: number;
    accuracy_re: number;
    n: number;
}

export interface ExcludedPoint {
    sample_id: string;
    nominal_conc: number;
    observed_conc: number;
    reason_code: string;
    reason_desc: string;
    approved_by: string;
    timestamp: string;
}

export interface AnalyticalRun {
    run_id: string;
    analysis_date: string;
    status: 'Accepted' | 'Rejected' | 'Pending';
    qc_results: Record<string, QCResult>;
    excluded_points: ExcludedPoint[];
}

export interface CellData {
    chapter_metadata: {
        chapter_id: string;
        study_id: string;
        analyte_name: string;
        matrix: string;
        calculation_engine: string;
        timestamp: string;
    };
    analytical_runs: AnalyticalRun[];
    inter_batch_summary: {
        precision_range_cv: [number, number];
        accuracy_range_re: [number, number];
        is_compliant: boolean;
        regulatory_standard: string;
    };
    audit_trail: {
        source_files: Array<{ file_name: string; hash: string; range: string }>;
        logic_checksum: string;
    };
}

export const MOCK_CELL_DATA: CellData = {
    chapter_metadata: {
        chapter_id: "CH_2_PRECISION_ACCURACY",
        study_id: "FOXU-2026-BIO-001",
        analyte_name: "Compound X",
        matrix: "Beagle Dog Plasma",
        calculation_engine: "Firecracker-Py-3.10-v1.2",
        timestamp: "2026-01-21T20:30:00Z"
    },
    analytical_runs: [
        {
            run_id: "RUN-01",
            analysis_date: "2026-01-15",
            status: "Accepted",
            qc_results: {
                "LLOQ": { nominal_conc: 1.00, mean_observed: 1.02, precision_cv: 16.5, accuracy_re: 2.0, n: 6 }, // FAIL: CV > 15%
                "LQC": { nominal_conc: 3.00, mean_observed: 2.95, precision_cv: 3.1, accuracy_re: -1.7, n: 6 },
                "MQC": { nominal_conc: 400.0, mean_observed: 412.0, precision_cv: 2.5, accuracy_re: 3.0, n: 6 },
                "HQC": { nominal_conc: 800.0, mean_observed: 785.0, precision_cv: 1.8, accuracy_re: -1.9, n: 6 }
            },
            excluded_points: [
                {
                    sample_id: "LQC-03",
                    nominal_conc: 3.00,
                    observed_conc: 0.5,
                    reason_code: "ERR_TECHNICAL_01",
                    reason_desc: "Sample spill during processing",
                    approved_by: "SD_John_Doe",
                    timestamp: "2026-01-15T14:22:11Z"
                },
                {
                    sample_id: "HQC-05",
                    nominal_conc: 800.00,
                    observed_conc: 1200.0,
                    reason_code: "ERR_inst_02",
                    reason_desc: "Instrument signal saturation",
                    approved_by: "SD_Jane_Smith",
                    timestamp: "2026-01-15T14:45:00Z"
                },
                {
                    sample_id: "LLOQ-01",
                    nominal_conc: 1.00,
                    observed_conc: 0.0,
                    reason_code: "ERR_human_03",
                    reason_desc: "Vial missing",
                    approved_by: "System_Auto",
                    timestamp: "2026-01-15T14:10:00Z"
                }
            ]
        },
        {
            run_id: "RUN-02",
            analysis_date: "2026-01-16",
            status: "Accepted",
            qc_results: {
                "LLOQ": { nominal_conc: 1.00, mean_observed: 0.98, precision_cv: 3.8, accuracy_re: -2.0, n: 6 },
                "LQC": { nominal_conc: 3.00, mean_observed: 3.05, precision_cv: 2.9, accuracy_re: 1.7, n: 6 },
                "MQC": { nominal_conc: 400.0, mean_observed: 405.0, precision_cv: 2.1, accuracy_re: 1.25, n: 6 },
                "HQC": { nominal_conc: 800.0, mean_observed: 790.0, precision_cv: 1.5, accuracy_re: -1.25, n: 6 }
            },
            excluded_points: []
        }
    ],
    inter_batch_summary: {
        precision_range_cv: [1.8, 16.5], // Updated range
        accuracy_range_re: [-1.9, 3.0],
        is_compliant: false, // Updated status
        regulatory_standard: "NMPA/FDA BMV Guidelines 2026"
    },
    audit_trail: {
        source_files: [
            { file_name: "raw_data_batch_01.xlsx", hash: "sha256:e3b0c442...", range: "Sheet1!B2:G20" }
        ],
        logic_checksum: "logic_v5.4_stable"
    }
};
