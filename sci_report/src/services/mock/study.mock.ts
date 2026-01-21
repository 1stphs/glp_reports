
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
