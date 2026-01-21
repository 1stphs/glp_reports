import React, { useState } from 'react';
import type { AnalyticalRun } from '../../../services/mock/cell.mock';

interface P1Props {
    data: AnalyticalRun[];
    isExpanded: boolean;
    onContinue: () => void;
}

const P1_DataMapping: React.FC<P1Props> = ({ /* data, */ isExpanded, onContinue }) => {
    const [confirmedFiles, setConfirmedFiles] = useState<Record<string, boolean>>({});

    // Mock list of source files
    const sourceFiles = [
        { id: 'f1', name: 'raw_data_batch_01.xlsx', size: '2.4MB', timestamp: '2026-01-15 10:00' },
        { id: 'f2', name: 'protocol_v2.pdf', size: '1.1MB', timestamp: '2026-01-10 14:30' },
    ];

    const handleToggleFile = (id: string) => {
        setConfirmedFiles((prev: Record<string, boolean>) => ({ ...prev, [id]: !prev[id] }));
    };

    const allConfirmed = sourceFiles.every(f => confirmedFiles[f.id]);

    if (!isExpanded) {
        return (
            <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-status-pass)', marginRight: 'var(--space-2)' }}>✓</span>
                Data mapped from {sourceFiles.length} source files. (Click to expand)
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', padding: 'var(--space-6)' }}>
            {/* Left: Data Contract / File List */}
            <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>
                    1. Source Data (Grounding)
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                    Confirm the source files for this analysis chapter.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {sourceFiles.map(file => (
                        <div
                            key={file.id}
                            onClick={() => handleToggleFile(file.id)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: 'var(--space-3)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                backgroundColor: confirmedFiles[file.id] ? 'var(--color-bg-surface-elevated)' : 'transparent',
                                borderColor: confirmedFiles[file.id] ? 'var(--color-primary)' : 'var(--color-border)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <span style={{ fontSize: 'var(--text-xl)' }}>📄</span>
                                <div>
                                    <div style={{ fontWeight: '500' }}>{file.name}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                                        {file.size} • {file.timestamp}
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                width: '1.25rem', height: '1.25rem',
                                borderRadius: '50%',
                                border: '2px solid',
                                borderColor: confirmedFiles[file.id] ? 'var(--color-primary)' : 'var(--color-border)',
                                backgroundColor: confirmedFiles[file.id] ? 'var(--color-primary)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }}>
                                {confirmedFiles[file.id] && '✓'}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'var(--space-6)' }}>
                    <button
                        onClick={onContinue}
                        disabled={!allConfirmed}
                        style={{
                            width: '100%',
                            padding: 'var(--space-3)',
                            backgroundColor: allConfirmed ? 'var(--color-primary)' : 'var(--color-border)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            cursor: allConfirmed ? 'pointer' : 'not-allowed',
                            transition: 'background-color 0.2s',
                            opacity: allConfirmed ? 1 : 0.7
                        }}
                    >
                        Confirm & Map Data →
                    </button>
                </div>
            </div>

            {/* Right: Preview (Placeholder) */}
            <div style={{
                backgroundColor: 'var(--color-bg-canvas)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '300px'
            }}>
                <div style={{ fontSize: '3rem', opacity: 0.2 }}>👁️</div>
                <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                    Document Preview Area
                </p>
            </div>
        </div>
    );
};

export default P1_DataMapping;
