
import React from 'react';

const FewShotManager: React.FC = () => {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
            <div style={{
                padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-surface)', fontWeight: 'bold', fontSize: 'var(--text-sm)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <span>🎨 Narrative Patterns (Right Brain)</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>3 Examples</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-canvas)' }}>
                {/* Example Card 1 */}
                <div style={{
                    padding: 'var(--space-4)', backgroundColor: 'white', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)', marginBottom: 'var(--space-4)', boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#dafbe1', color: '#1a7f37', fontWeight: 'bold' }}>SCENARIO: NORMAL</span>
                        <button style={{ border: 'none', background: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>✎</button>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', lineHeight: '1.5', color: 'var(--color-text-main)' }}>
                        Following oral administration, Compound X was rapidly absorbed with a mean Tmax of
                        <span style={{ color: '#0969da', backgroundColor: '#ddf4ff', padding: '0 2px', borderRadius: '2px', fontWeight: 'bold' }}> {'{'}tmax_mean{'}'} </span>
                        hours. The systemic exposure (AUC0-t) was
                        <span style={{ color: '#0969da', backgroundColor: '#ddf4ff', padding: '0 2px', borderRadius: '2px', fontWeight: 'bold' }}> {'{'}auc_val{'}'} </span>
                        ng·h/mL.
                    </p>
                </div>

                {/* Example Card 2 */}
                <div style={{
                    padding: 'var(--space-4)', backgroundColor: 'white', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)', marginBottom: 'var(--space-4)', boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fff8c5', color: '#9a6700', fontWeight: 'bold' }}>SCENARIO: HIGH VARIABILITY</span>
                        <button style={{ border: 'none', background: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>✎</button>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', lineHeight: '1.5', color: 'var(--color-text-main)' }}>
                        Significant inter-individual variability was observed, with a CV% of
                        <span style={{ color: '#d1242f', backgroundColor: '#ffebe9', padding: '0 2px', borderRadius: '2px', fontWeight: 'bold' }}> {'{'}cv_percent{'}'} </span>
                        %. This variability may be attributed to...
                    </p>
                </div>

                <button style={{
                    width: '100%', padding: 'var(--space-3)',
                    backgroundColor: 'white', border: '1px dashed var(--color-border)', color: 'var(--color-primary)',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', fontSize: 'var(--text-sm)'
                }}>
                    + Add Few-Shot Example
                </button>
            </div>
        </div>
    );
};

export default FewShotManager;
