
import React from 'react';

const DataContractEditor: React.FC = () => {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-surface)', fontWeight: 'bold', fontSize: 'var(--text-sm)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <span>🧠 Data Contract (Left Brain)</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>JSON Schema</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                {/* Mock Tree Editor UI */}
                <div style={{ paddingLeft: '0' }}>
                    <span style={{ color: '#0550ae' }}>"chapter_id"</span>: <span style={{ color: '#a31515' }}>"CH_2_PK_SUMMARY"</span>,
                </div>
                <div style={{ paddingLeft: '0' }}>
                    <span style={{ color: '#0550ae' }}>"inputs"</span>: {'{'}
                </div>
                <div style={{ paddingLeft: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#0550ae' }}>"mean_cmax"</span>:
                    <span style={{ color: '#098658' }}>Number</span>
                    <span style={{ fontSize: '10px', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '1px 4px', borderRadius: '4px' }}>Required</span>
                </div>
                <div style={{ paddingLeft: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#0550ae' }}>"mean_auc"</span>:
                    <span style={{ color: '#098658' }}>Number</span>
                    <span style={{ fontSize: '10px', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '1px 4px', borderRadius: '4px' }}>Required</span>
                </div>
                <div style={{ paddingLeft: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#0550ae' }}>"tmax_range"</span>:
                    <span style={{ color: '#098658' }}>[Min, Max]</span>
                </div>
                <div style={{ paddingLeft: '0' }}>{'}'},</div>

                <div style={{ paddingLeft: '0', marginTop: '8px' }}>
                    <span style={{ color: '#0550ae' }}>"rules"</span>: [
                </div>
                <div style={{ paddingLeft: '20px' }}>
                    {'{'} <span style={{ color: '#0550ae' }}>"condition"</span>: <span style={{ color: '#a31515' }}>"cv &lt; 15%"</span>, <span style={{ color: '#0550ae' }}>"severity"</span>: <span style={{ color: '#a31515' }}>"warning"</span> {'}'}
                </div>
                <div style={{ paddingLeft: '0' }}>]</div>

                <button style={{
                    marginTop: 'var(--space-4)', width: '100%', padding: 'var(--space-2)',
                    border: '1px dashed var(--color-border)', color: 'var(--color-text-secondary)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px'
                }}>
                    + Add Field
                </button>
            </div>
        </div>
    );
};

export default DataContractEditor;
