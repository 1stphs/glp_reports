
import React from 'react';
import { MOCK_STUDY_FILES } from '../../../services/mock/study.mock';
import type { StudyFile } from '../../../services/mock/study.mock';

const RawMaterialPanel: React.FC = () => {
    const getIcon = (type: StudyFile['type']) => {
        switch (type) {
            case 'protocol': return '📄';
            case 'data': return '📊';
            case 'report': return '📝';
            default: return '📁';
        }
    };

    const getStatusColor = (status: StudyFile['status']) => {
        switch (status) {
            case 'parsed': return 'var(--color-status-pass)';
            case 'parsing': return 'var(--color-status-warn)';
            case 'error': return 'var(--color-status-fail)';
            default: return 'var(--color-text-tertiary)';
        }
    };

    return (
        <div style={{
            height: '100%',
            backgroundColor: '#f8fafc',
            borderRight: '1px solid var(--color-border)',
            display: 'flex', flexDirection: 'column'
        }}>
            <div style={{
                padding: 'var(--space-4)',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'white'
            }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>Raw Materials</h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                    Data Source & Sensing
                </p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
                {MOCK_STUDY_FILES.map(file => (
                    <div key={file.id} style={{
                        padding: 'var(--space-3)',
                        backgroundColor: 'white',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>{getIcon(file.type)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: 'var(--text-sm)', fontWeight: '500',
                                color: 'var(--color-text-main)',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }} title={file.name}>
                                {file.name}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                                {file.uploadDate}
                            </div>
                        </div>
                        {/* Status Light */}
                        <div style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            backgroundColor: getStatusColor(file.status),
                            boxShadow: `0 0 4px ${getStatusColor(file.status)}`
                        }} title={file.status} />
                    </div>
                ))}
            </div>

            <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)', backgroundColor: 'white' }}>
                <div style={{
                    padding: 'var(--space-3)',
                    border: '1px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    color: 'var(--color-text-tertiary)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)'
                }}>
                    + Upload New Material
                </div>
            </div>
        </div>
    );
};

export default RawMaterialPanel;
