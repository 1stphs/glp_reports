
import React from 'react';
import DataContractEditor from './components/DataContractEditor';
import FewShotManager from './components/FewShotManager';
import FormatPreview from './components/FormatPreview';

interface TemplateDetailProps {
    onNavigate: (view: string) => void;
}

const TemplateDetailView: React.FC<TemplateDetailProps> = ({ onNavigate }) => {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div style={{
                height: '60px', padding: '0 var(--space-6)', borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <button
                        onClick={() => onNavigate('library')}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 'var(--text-lg)' }}
                    >
                        ←
                    </button>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>NMPA_PK_Report_Template <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>v5.2</span></div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Last edited 2h ago</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-status-pass)' }}>
                        ● Saved
                    </span>
                    <button style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer' }}>
                        Diff
                    </button>
                    <button style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer' }}>
                        Publish v5.3
                    </button>
                </div>
            </div>

            {/* Tri-Fold Grid */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1.3fr', overflow: 'hidden' }}>
                {/* 1. Left Brain: Data Contract */}
                <div style={{ overflow: 'hidden' }}>
                    <DataContractEditor />
                </div>

                {/* 2. Middle Brain: Few-Shots */}
                <div style={{ overflow: 'hidden' }}>
                    <FewShotManager />
                </div>

                {/* 3. Expression: Format */}
                <div style={{ overflow: 'hidden' }}>
                    <FormatPreview />
                </div>
            </div>
        </div>
    );
};

export default TemplateDetailView;
