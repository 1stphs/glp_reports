
import React, { useEffect, useState } from 'react';
import { useStudy } from '../../contexts/StudyContext';
import { mockService } from '../../services/mockAdapter';
import type { StudySection } from '../../services/mock/study.mock';
import SwimlaneGroup from '../../components/business/Swimlane/SwimlaneGroup';

const ControlCenterView: React.FC = () => {
    const { state } = useStudy();
    const [sections, setSections] = useState<StudySection[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // Ensure state.currentStudyId is a string before passing
            const studyId = state.currentStudyId || 'default_study';
            const data = await mockService.getStudySections(studyId);
            setSections(data);
        };
        fetchData();
    }, [state.currentStudyId]);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-6)' }}>
            <header style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}>Task Control Center</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Study: {state.currentStudyId} | Monitoring Pipeline Status
                </p>
            </header>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {/* Metric Card 1 */}
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>Total Tasks</div>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}>{sections.reduce((acc, s) => acc + s.tasks.length, 0)}</div>
                </div>
                {/* Metric Card 2 */}
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>Exceptions</div>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-status-fail)' }}>
                        {sections.reduce((acc, s) => acc + s.tasks.filter(t => t.status === 'critical').length, 0)}
                    </div>
                </div>
            </div>

            {/* Swimlanes */}
            <div>
                {sections.map(section => (
                    <SwimlaneGroup
                        key={section.id}
                        title={section.title}
                        tasks={section.tasks}
                        defaultExpanded={true}
                    />
                ))}
            </div>
        </div>
    );
};

export default ControlCenterView;
