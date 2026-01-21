
import React, { useMemo } from 'react';
import { useStudy } from '../../../contexts/StudyContext';
import { MOCK_STUDY_SECTIONS } from '../../../services/mock/study.mock';

interface StudyDashboardProps {
    onNavigate: (view: 'control') => void;
}

const StudyDashboard: React.FC<StudyDashboardProps> = ({ onNavigate }) => {
    const { state } = useStudy();

    // Aggregate metrics from mock data
    const metrics = useMemo(() => {
        let critical = 0;
        let warning = 0;
        let totalTasks = 0;
        let completedTasks = 0; // simplified: assuming non-critical/warning is 'good' but we don't have 'done' status in mock yet, just 'healthy'

        MOCK_STUDY_SECTIONS.forEach(sec => {
            sec.tasks.forEach(t => {
                totalTasks++;
                if (t.status === 'critical') critical++;
                if (t.status === 'warning') warning++;
                if (t.status === 'healthy') completedTasks++;
            });
        });

        const progress = Math.round((completedTasks / totalTasks) * 100);
        return { critical, warning, totalTasks, progress };
    }, []);

    const overallHealth = metrics.critical > 0 ? 'Critical' : metrics.warning > 0 ? 'Warning' : 'Healthy';
    const healthColor = metrics.critical > 0 ? 'var(--color-status-fail)' : metrics.warning > 0 ? 'var(--color-status-warn)' : 'var(--color-status-pass)';
    const healthBg = metrics.critical > 0 ? 'var(--color-status-fail-bg)' : metrics.warning > 0 ? 'var(--color-status-warn-bg)' : 'var(--color-status-pass-bg)';

    return (
        <div style={{ padding: 'var(--space-8)' }}>
            {/* 3.1 Status Header */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>Today's Overview</h2>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <div style={{
                        padding: 'var(--space-4)', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)'
                    }}>
                        <div style={{ fontSize: '1.5rem' }}>🔴</div>
                        <div>
                            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>{metrics.critical}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Critical Alerts</div>
                        </div>
                    </div>
                    <div style={{
                        padding: 'var(--space-4)', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)'
                    }}>
                        <div style={{ fontSize: '1.5rem' }}>⚠️</div>
                        <div>
                            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>{metrics.warning}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Pending Warnings</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3.2 Study Cards */}
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>Active Studies</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
                {/* Active Study Card */}
                <div style={{
                    backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-md)', overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 'bold', fontSize: 'var(--text-md)' }}>{state.currentStudyId}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Updated 2h ago</div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: 'var(--space-6)' }}>
                        {/* Progress */}
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}>
                                <span>Progress</span>
                                <span>{metrics.progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-bg-canvas)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${metrics.progress}%`, height: '100%', backgroundColor: 'var(--color-primary)' }} />
                            </div>
                        </div>

                        {/* Health Status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Health:</span>
                            <span style={{
                                padding: '2px 8px', borderRadius: '12px', fontSize: 'var(--text-xs)', fontWeight: 'bold',
                                backgroundColor: healthBg, color: healthColor
                            }}>
                                {overallHealth.toUpperCase()}
                            </span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                            <button
                                onClick={() => onNavigate('control')}
                                style={{
                                    padding: 'var(--space-2)', fontSize: 'var(--text-sm)',
                                    backgroundColor: 'var(--color-primary)', color: 'white', border: 'none',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                                }}
                            >
                                <span>🖥️</span>
                                Workbench
                            </button>
                            <button
                                style={{
                                    padding: 'var(--space-2)', fontSize: 'var(--text-sm)',
                                    backgroundColor: 'var(--color-bg-canvas)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                                }}
                            >
                                <span>⚙️</span>
                                Config
                            </button>
                            <button
                                style={{
                                    padding: 'var(--space-2)', fontSize: 'var(--text-sm)',
                                    backgroundColor: 'var(--color-bg-canvas)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                                }}
                            >
                                <span>📜</span>
                                History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyDashboard;
