
export interface StudyTask {
    id: string;
    title: string;
    status: 'healthy' | 'warning' | 'critical' | 'locked';
    confidence: number;
}

export interface StudySection {
    id: string;
    title: string;
    tasks: StudyTask[];
}

export const MOCK_STUDY_SECTIONS: StudySection[] = [
    {
        id: "sec_1",
        title: "1. 摘要 (Summary)",
        tasks: [
            { id: "t_1_1", title: "Study Abstract", status: "healthy", confidence: 99 },
        ]
    },
    {
        id: "sec_2",
        title: "2. 分析方法 (Methodology)",
        tasks: [
            { id: "t_2_1", title: "Reference Standards", status: "healthy", confidence: 98 },
            { id: "t_2_2", title: "Calibration Curve", status: "warning", confidence: 85 },
        ]
    },
    {
        id: "sec_3",
        title: "3. 结果 (Results)",
        tasks: [
            { id: "t_3_1", title: "Precision & Accuracy", status: "critical", confidence: 60 },
            { id: "t_3_2", title: "Selectivity", status: "healthy", confidence: 95 },
            { id: "t_3_3", title: "Matrix Effect", status: "healthy", confidence: 96 },
        ]
    }
];

export interface StudyFile {
    id: string;
    name: string;
    type: 'protocol' | 'data' | 'report' | 'other';
    status: 'parsed' | 'parsing' | 'error';
    uploadDate: string;
}

export const MOCK_STUDY_FILES: StudyFile[] = [
    { id: 'f1', name: 'NS25318BV01生物分析验证方案(SD rat)_Final@20250901.docx', type: 'protocol', status: 'parsed', uploadDate: '2025-09-01' },
    { id: 'f2', name: 'NS25318BV01-RAT-BA-REPORT-Final-杨接敏-1@20251226.docx', type: 'report', status: 'parsed', uploadDate: '2025-12-26' },
    { id: 'f3', name: 'Qced NS25318BV01二次数据汇总@20250916（1-6）.xlsx', type: 'data', status: 'parsed', uploadDate: '2025-09-17' },
    { id: 'f4', name: 'Qced NN25318BV01二次数据汇总-LTS(Run7~8)@20251211.xlsx', type: 'data', status: 'parsed', uploadDate: '2025-12-11' },
    { id: 'f5', name: 'Qced NS25318BV01二次数据汇总-LTS(Run9)@20251217.xlsx', type: 'data', status: 'parsing', uploadDate: '2025-12-17' },
];
