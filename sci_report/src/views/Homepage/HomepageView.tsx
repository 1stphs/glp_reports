
import React, { useState } from 'react';
import StudyWizard from './Wizard/StudyWizard';

interface HomepageProps {
    onNavigate: (view: 'control') => void;
}

const HomepageView: React.FC<HomepageProps> = ({ onNavigate }) => {
    const [showWizard, setShowWizard] = useState(false);

    return (
        <div style={{ padding: 'var(--space-12)' }}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: 'var(--space-4)', background: 'linear-gradient(to right, var(--color-primary), var(--color-status-pass))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    GLP Intelligence Suite
                </h1>
                <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    Accelerate your bioanalytical workflows with White-Box AI.
                    <br />
                    Traceable. Compliant. Intelligent.
                </p>
            </div>

            {/* Action Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)', maxWidth: '1000px', margin: '0 auto' }}>

                {/* New Study Card */}
                <div
                    onClick={() => setShowWizard(true)}
                    style={{
                        padding: 'var(--space-8)',
                        border: '2px dashed var(--color-primary)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--color-bg-surface)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🚀</div>
                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>New Study Analysis</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Start from protocol & raw data ingestion.
                    </p>
                </div>

                {/* Recent Study Card */}
                <div
                    onClick={() => onNavigate('control')}
                    style={{
                        padding: 'var(--space-8)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--color-bg-surface)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📊</div>
                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>FOXU-2026-BIO-001</h3>
                    <div style={{ marginTop: 'var(--space-2)' }}>
                        <span style={{ backgroundColor: 'var(--color-status-warn-bg)', color: 'var(--color-status-warn)', padding: '2px 8px', borderRadius: '12px', fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>Last Active</span>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                        Resume analysis (Phase 2 Pending)
                    </p>
                </div>
            </div>

            {/* Wizard Modal */}
            {showWizard && (
                <StudyWizard
                    onCancel={() => setShowWizard(false)}
                    onComplete={(id) => {
                        setShowWizard(false);
                        console.log("Study Created:", id);
                        onNavigate('control');
                    }}
                />
            )}
        </div>
    );
};

export default HomepageView;
