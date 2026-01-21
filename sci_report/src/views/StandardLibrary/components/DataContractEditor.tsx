
import React from 'react';


interface DataContractEditorProps {
    template?: any;
}

const DataContractEditor: React.FC<DataContractEditorProps> = ({ template }) => {
    const variables = template?.variables || {};

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
                {Object.keys(variables).length > 0 ? (
                    Object.entries(variables).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: '8px' }}>
                            <div style={{ color: '#0550ae' }}>"{key}"</div>
                            <div style={{ paddingLeft: '20px', color: '#098658', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                {String(value)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                        No variables extracted for this template.
                    </div>
                )}

                <div style={{ paddingLeft: '0', marginTop: '16px', borderTop: '1px dashed #ddd', paddingTop: '8px' }}>
                    <span style={{ color: '#0550ae' }}>"compliance_rules"</span>: [
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
