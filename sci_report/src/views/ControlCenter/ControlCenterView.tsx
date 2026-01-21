
import React, { useEffect, useState } from 'react';
import { useStudy } from '../../contexts/StudyContext';
import { mockService } from '../../services/mockAdapter';
import type { StudySection } from '../../services/mock/study.mock';
import SwimlaneGroup from '../../components/business/Swimlane/SwimlaneGroup';
import RawMaterialPanel from './components/RawMaterialPanel';

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
        <div style={{
            display: 'flex',
            height: 'calc(100vh - 60px)', // Adjust for potential global header
            backgroundColor: 'var(--color-bg-canvas)'
        }}>
            {/* Left Panel: Raw Material Sensing (25%) */}
            <div style={{ width: '25%', minWidth: '300px', height: '100%' }}>
                <RawMaterialPanel />
            </div>

            {/* Right Panel: Task Matrix (75%) */}
            <div style={{ flex: 1, padding: 'var(--space-6)', overflowY: 'auto' }}>
                <header style={{ marginBottom: 'var(--space-8)', borderBottom: '2px solid var(--color-brand-primary)', paddingBottom: 'var(--space-4)' }}>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}>Task Control Center (V2)</h1>
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
        </div>
    );
};

export default ControlCenterView;
