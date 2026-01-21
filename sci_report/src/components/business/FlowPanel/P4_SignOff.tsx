
import React, { useState } from 'react';

const P4_SignOff: React.FC<{
    isExpanded: boolean;
}> = ({ isExpanded }) => {

    const [signed, setSigned] = useState(false);

    if (!isExpanded) return null;

    return (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>
                4. Final Review & Sign-off
            </h3>

            <div style={{
                maxWidth: '600px', margin: '0 auto',
                padding: 'var(--space-8)',
                backgroundColor: 'white',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--color-border)',
                marginBottom: 'var(--space-6)',
                textAlign: 'left'
            }}>
                <p style={{ fontFamily: 'serif', fontSize: 'var(--text-lg)', lineHeight: '1.8' }}>
                    "The intra-batch precision (CV) for QC samples ranged from 1.8% to 4.2%, which is well within the acceptable limit of 15.0%.
                    The accuracy (%Nominal) ranged from -1.9% to 3.0%, meeting the acceptance criteria of ±15.0%."
                </p>
            </div>

            {signed ? (
                <div style={{ color: 'var(--color-status-pass)', fontWeight: 'bold', fontSize: 'var(--text-lg)' }}>
                    ✓ Signed by Dr. Xuke on {new Date().toLocaleDateString()}
                </div>
            ) : (
                <button
                    onClick={() => setSigned(true)}
                    style={{
                        padding: 'var(--space-3) var(--space-8)',
                        backgroundColor: 'var(--color-status-pass)', color: 'white',
                        border: 'none', borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-lg)', fontWeight: 'bold',
                        boxShadow: 'var(--shadow-md)'
                    }}
                >
                    ✍️ Sign Off Section
                </button>
            )}
        </div>
    );
};

export default P4_SignOff;
