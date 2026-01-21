
import React, { useState } from 'react';

const P3_Drafting: React.FC<{
    isExpanded: boolean;
    onContinue: () => void;
}> = ({ isExpanded, onContinue }) => {

    const [draft, setDraft] = useState(
        `Summary Execution of Precision and Accuracy
...
The intra-batch precision (CV) for QC samples ranged from 1.8% to 4.2%, which is well within the acceptable limit of 15.0%.
The accuracy (%Nominal) ranged from -1.9% to 3.0%, meeting the acceptance criteria of ±15.0%.
...`
    );

    if (!isExpanded) return null;

    return (
        <div style={{ padding: 'var(--space-6)', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-6)' }}>
            {/* Left: Logic Reference (Mini P2) */}
            <div style={{ borderRight: '1px solid var(--color-border)', paddingRight: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                    FACTS (LOCKED)
                </h4>
                <div style={{ fontSize: 'var(--text-sm)' }}>
                    <div><strong>Precision Range:</strong> 1.8% - 4.2%</div>
                    <div><strong>Accuracy Range:</strong> -1.9% - 3.0%</div>
                </div>
            </div>

            {/* Right: Editor */}
            <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>
                    3. Narrative Generation (Drafting)
                </h3>
                <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    style={{
                        width: '100%', height: '200px',
                        padding: 'var(--space-4)',
                        borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
                        lineHeight: '1.6'
                    }}
                />

                <div style={{ marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-status-pass)' }}>
                        ✓ Smart Diff: No number discrepancies found.
                    </div>
                    <button
                        onClick={onContinue}
                        style={{
                            padding: 'var(--space-2) var(--space-4)',
                            backgroundColor: 'var(--color-primary)', color: 'white',
                            border: 'none', borderRadius: 'var(--radius-md)'
                        }}
                    >
                        Generate Preview (P4) →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default P3_Drafting;
