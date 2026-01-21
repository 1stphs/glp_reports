
import React, { useState, useMemo } from 'react';
import StudyWizard from './Wizard/StudyWizard';
import { useStudy } from '../../contexts/StudyContext';
import { MOCK_STUDY_SECTIONS } from '../../services/mock/study.mock';

interface HomepageProps {
    onNavigate: (view: 'control' | 'detail') => void;
}

const HomepageView: React.FC<HomepageProps> = ({ onNavigate }) => {
    const [showWizard, setShowWizard] = useState(false);
    const { state } = useStudy();

    // Aggregate metrics from mock data
    const metrics = useMemo(() => {
        let critical = 0;
        let warning = 0;
        let totalTasks = 0;
        let completedTasks = 0;

        MOCK_STUDY_SECTIONS.forEach(sec => {
            sec.tasks.forEach(t => {
                totalTasks++;
                if (t.status === 'critical') critical++;
                if (t.status === 'warning') warning++;
                if (t.status === 'healthy') completedTasks++;
            });
        });

        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return { critical, warning, totalTasks, progress };
    }, []);

    const overallHealth = metrics.critical > 0 ? 'Critical' : metrics.warning > 0 ? 'Warning' : 'Healthy';
    const healthColor = metrics.critical > 0 ? 'var(--color-status-fail)' : metrics.warning > 0 ? 'var(--color-status-warn)' : 'var(--color-status-pass)';

    // Dynamic Mock Data for the prototype
    const mockStudies = [
        { id: state.currentStudyId, type: 'GLP STUDY', reg: 'NMPA', progress: metrics.progress, health: overallHealth, healthColor: healthColor },
        { id: 'FOXU-2025-IND-204', type: 'IND FILING', reg: 'FDA', progress: 85, health: 'Healthy', healthColor: 'var(--color-status-pass)' },
        { id: 'FOXU-2025-PK-089', type: 'PK ANALYSIS', reg: 'NMPA', progress: 12, health: 'Healthy', healthColor: 'var(--color-status-pass)' },
        { id: 'FOXU-2025-TOX-101', type: 'TOXICOLOGY', reg: 'OECD', progress: 45, health: 'Warning', healthColor: 'var(--color-status-warn)' }
    ];

    return (
        <div style={{ padding: 'var(--space-8)', position: 'relative', minHeight: '80vh' }}>

            {/* 1. Marketing Hero (Restored) */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)', paddingTop: 'var(--space-8)' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: 'var(--space-4)', display: 'inline-block', position: 'relative' }}>
                    <span style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-status-pass))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GLP In Silico</span>
                    <span style={{
                        position: 'absolute', top: '-15px', right: '-90px',
                        fontSize: '1rem', padding: '4px 12px', borderRadius: '20px',
                        backgroundColor: '#e0e7ff', color: '#4338ca',
                        border: '1px solid #c7d2fe', whiteSpace: 'nowrap'
                    }}>Foxu.AI</span>
                </h1>
                <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    Accelerate your bioanalytical workflows with White-Box AI.
                    <br />
                    Traceable. Compliant. Intelligent.
                </p>
            </div>

            {/* 2. Active Studies Grid */}
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>Active Studies</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>

                {/* New Study Card - Redesigned */}
                <div
                    onClick={() => setShowWizard(true)}
                    style={{
                        padding: 'var(--space-8)',
                        border: '2px dashed var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: '#fafafa', // Subtle contrast 
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', // Align bottom-left
                        color: 'var(--color-text-secondary)',
                        minHeight: '220px',
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.backgroundColor = '#fdfaff'; // Very subtle purple tint
                        const icon = e.currentTarget.querySelector('.new-icon') as HTMLElement;
                        if (icon) icon.style.transform = 'scale(1.1) rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.backgroundColor = '#fafafa';
                        const icon = e.currentTarget.querySelector('.new-icon') as HTMLElement;
                        if (icon) icon.style.transform = 'scale(1) rotate(0deg)';
                    }}
                >
                    <div className="new-icon" style={{
                        position: 'absolute', top: '20px', right: '20px',
                        fontSize: '3rem', color: 'var(--color-border)',
                        transition: 'all 0.4s ease',
                        opacity: 0.5
                    }}>+</div>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                        New Study
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                        Start a new analysis workflow
                    </p>
                </div>

                {/* Mock Active Studies List */}
                {mockStudies.map((study, idx) => (
                    <div key={idx} style={{
                        backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        minHeight: '220px'
                    }}>
                        {/* Header: Minimal, focusing on ID */}
                        <div style={{ padding: 'var(--space-6) var(--space-6) 0 var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{
                                    fontWeight: '800', fontSize: '1.6rem', letterSpacing: '-0.5px',
                                    marginBottom: 'var(--space-1)', color: 'var(--color-text-main)'
                                }}>
                                    {study.id}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontWeight: '500' }}>{study.type}</span>
                                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f3f4f6', color: '#666', fontWeight: 'bold' }}>{study.reg}</span>
                                </div>
                            </div>
                            {/* Status Dot Only */}
                            <div title={`Health: ${study.health}`} style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                backgroundColor: study.healthColor,
                                boxShadow: `0 0 8px ${study.healthColor}`
                            }} />
                        </div>

                        {/* Body */}
                        <div style={{ padding: 'var(--space-6)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>

                            {/* Progress Label */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-3)' }}>
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Completion</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '300', color: 'var(--color-primary)' }}>{study.progress}%</span>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', marginBottom: 'var(--space-6)' }}>
                                <div style={{ width: `${study.progress}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }} />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                <button
                                    onClick={() => onNavigate('control')}
                                    style={{
                                        padding: 'var(--space-3)', fontSize: 'var(--text-sm)', fontWeight: '600',
                                        backgroundColor: 'var(--color-text-main)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer', transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'black'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-text-main)'}
                                >
                                    Workbench
                                </button>
                                <button
                                    onClick={() => onNavigate('detail')}
                                    style={{
                                        padding: 'var(--space-3)', fontSize: 'var(--text-sm)', fontWeight: '600',
                                        backgroundColor: 'white', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer', transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    Report
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Wizard Modal */}
            {showWizard && (
                <StudyWizard
                    onCancel={() => setShowWizard(false)}
                    onComplete={(id) => {
                        setShowWizard(false);
                        console.log("Study Created:", id);
                        // Stay on homepage, but ideally refresh list. 
                        // For prototype, the card is static so it 'looks' like it updated or navigated.
                    }}
                />
            )}

            {/* Demo Mode Floating Button */}
            <button
                onClick={() => onNavigate('detail')}
                style={{
                    position: 'fixed', bottom: 'var(--space-8)', right: 'var(--space-8)',
                    padding: 'var(--space-4) var(--space-6)',
                    backgroundColor: '#8b5cf6', color: 'white',
                    borderRadius: 'var(--radius-full)', border: 'none',
                    boxShadow: 'var(--shadow-float)', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: 'var(--text-md)',
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    zIndex: 'var(--z-modal)',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <span>🧪</span>
                Enter Simulation Lab (Demo)
            </button>

            <footer style={{ marginTop: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
                &copy; 2026 Foxu.AI - GLP In Silico. All Rights Reserved.
            </footer>
        </div>
    );
};

export default HomepageView;
