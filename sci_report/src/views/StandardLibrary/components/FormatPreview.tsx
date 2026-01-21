
import React from 'react';

const FormatPreview: React.FC = () => {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-surface)', fontWeight: 'bold', fontSize: 'var(--text-sm)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <span>📄 Style & Format (Expression)</span>
                <button style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                    Upload .docx
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-8)', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center' }}>
                {/* A4 Paper Simulation */}
                <div style={{
                    width: '210mm', minHeight: '297mm', padding: '25mm',
                    backgroundColor: 'white', boxShadow: 'var(--shadow-md)',
                    fontFamily: '"Times New Roman", Times, serif', color: 'black'
                }}>
                    <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '12pt', textAlign: 'center' }}>2.0 PHARMACOKINETIC RESULTS</h2>

                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '6pt' }}>2.1 Summary of Findings</h3>

                    <p style={{ fontSize: '11pt', lineHeight: '1.5', textAlign: 'justify', marginBottom: '12pt' }}>
                        Following single oral administration of Compound X at 10 mg/kg, the mean Cmax was
                        <span style={{ backgroundColor: '#eeeeee' }}> 450 ± 32 </span> ng/mL.
                        The Tmax occurred between <span style={{ backgroundColor: '#eeeeee' }}> 1.0 </span> and <span style={{ backgroundColor: '#eeeeee' }}> 2.0 </span> hours post-dose.
                    </p>

                    <p style={{ fontSize: '11pt', lineHeight: '1.5', textAlign: 'justify' }}>
                        No significant adverse effects were noted during the observation period. All calculated pharmacokinetic parameters were within expected historical ranges.
                    </p>

                    <div style={{ marginTop: '24pt', borderTop: '1px solid black', width: '100px' }}></div>
                    <div style={{ fontSize: '10pt', fontStyle: 'italic', marginTop: '4pt' }}>Figure 2-1: Mean Plasma Concentration vs Time</div>
                </div>
            </div>
        </div>
    );
};

export default FormatPreview;
