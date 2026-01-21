
import React, { useState } from 'react';

// Simplified mock types
interface QCResult {
    nominal_conc: number;
    mean_observed: number;
    precision_cv: number;
    accuracy_re: number;
    n: number;
}

const P2_LogicCheck: React.FC<{
    isExpanded: boolean;
    onContinue: () => void;
}> = ({ isExpanded, onContinue }) => {
    // Mock Data based on contract
    // Mock Data based on contract
    const [qcResults] = useState<Record<string, QCResult>>({
        "LLOQ": { nominal_conc: 1.00, mean_observed: 1.02, precision_cv: 4.2, accuracy_re: 2.0, n: 6 },
        "LQC": { nominal_conc: 3.00, mean_observed: 2.95, precision_cv: 3.1, accuracy_re: -1.7, n: 6 },
        "MQC": { nominal_conc: 400.0, mean_observed: 412.0, precision_cv: 2.5, accuracy_re: 3.0, n: 6 },
        "HQC": { nominal_conc: 800.0, mean_observed: 785.0, precision_cv: 1.8, accuracy_re: -1.9, n: 6 }
    });

    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const toggleRow = (key: string) => {
        setExpandedRow(prev => prev === key ? null : key);
    };

    if (!isExpanded) return null;

    return (
        <div style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>
                2. Logic & Calculation (Sandbox)
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                        <th style={{ textAlign: 'left', padding: 'var(--space-3)' }}>QC Level</th>
                        <th style={{ textAlign: 'right', padding: 'var(--space-3)' }}>Nominal Conc.</th>
                        <th style={{ textAlign: 'right', padding: 'var(--space-3)' }}>Mean Observed</th>
                        <th style={{ textAlign: 'right', padding: 'var(--space-3)' }}>CV (%)</th>
                        <th style={{ textAlign: 'right', padding: 'var(--space-3)' }}>Accuracy (%)</th>
                        <th style={{ textAlign: 'center', padding: 'var(--space-3)' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(qcResults).map(([key, data]) => (
                        <React.Fragment key={key}>
                            <tr
                                onClick={() => toggleRow(key)}
                                style={{
                                    borderBottom: '1px solid var(--color-border)',
                                    cursor: 'pointer',
                                    backgroundColor: expandedRow === key ? 'var(--color-bg-surface-elevated)' : 'transparent'
                                }}
                            >
                                <td style={{ padding: 'var(--space-3)', fontWeight: 'bold' }}>{key}</td>
                                <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>{data.nominal_conc.toFixed(2)}</td>
                                <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>{data.mean_observed.toFixed(2)}</td>
                                <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>{data.precision_cv.toFixed(1)}</td>
                                <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>{data.accuracy_re.toFixed(1)}</td>
                                <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: '12px', fontSize: 'var(--text-xs)',
                                        backgroundColor: 'var(--color-status-pass-bg)', color: 'var(--color-status-pass)'
                                    }}>
                                        PASS
                                    </span>
                                </td>
                            </tr>
                            {/* MicroVM Log Expansion */}
                            {expandedRow === key && (
                                <tr style={{ backgroundColor: '#f1f5f9' }}>
                                    <td colSpan={6} style={{ padding: 'var(--space-4)' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                                            <div>$ microvm-exec --script calc_cv_accuracy.py --input {key}</div>
                                            <div style={{ color: 'var(--color-text-tertiary)' }}>&gt; Loading numpy...</div>
                                            <div>&gt; Calculation: (SD / Mean) * 100 = ({data.precision_cv})</div>
                                            <div style={{ color: 'var(--color-status-pass)' }}>&gt; VERIFIED: CV &lt; 15% (Guideline Limit)</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: 'var(--space-6)', textAlign: 'right' }}>
                <button
                    onClick={onContinue}
                    style={{
                        padding: 'var(--space-3) var(--space-6)',
                        backgroundColor: 'var(--color-primary)', color: 'white',
                        border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 'bold'
                    }}
                >
                    Lock Facts & Draft Narrative →
                </button>
            </div>
        </div>
    );
};

export default P2_LogicCheck;
