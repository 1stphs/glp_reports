
import React, { useState } from 'react';
import StudyWizard from './Wizard/StudyWizard';


interface HomepageProps {
    onNavigate: (view: 'control' | 'detail' | 'dashboard') => void;
}

const HomepageView: React.FC<HomepageProps> = ({ onNavigate }) => {
    const [showWizard, setShowWizard] = useState(false);

    return (
        <div style={{ padding: 'var(--space-12)', position: 'relative', minHeight: '80vh' }}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
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
                    onClick={() => onNavigate('dashboard')}
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
                        Go to Dashboard
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
                        onNavigate('dashboard');
                    }}
                />
            )}

            <footer style={{ marginTop: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>
                &copy; 2026 Foxu.AI - GLP In Silico. All Rights Reserved.
            </footer>

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
        </div>
    );
};

export default HomepageView;
