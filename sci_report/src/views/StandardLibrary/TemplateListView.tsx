
import React, { useState } from 'react';

// --- Mock Data ---
interface Template {
    id: string;
    name: string;
    version: string;
    species: string[];
    regulation: 'FDA' | 'NMPA' | 'OECD';
    status: 'Published' | 'Draft' | 'Reviewing';
    lastModified: string;
    author: string;
}

const MOCK_TEMPLATES: Template[] = [
    { id: 'T001', name: 'NMPA_PK_Report_Template', version: 'v5.2', species: ['Beagle Dog', 'Cynomolgus Monkey'], regulation: 'NMPA', status: 'Published', lastModified: '2026-01-15', author: 'Dr. Wang' },
    { id: 'T002', name: 'FDA_Tox_Report_Acute', version: 'v3.0', species: ['Rat', 'Mouse'], regulation: 'FDA', status: 'Published', lastModified: '2025-12-10', author: 'Sarah J.' },
    { id: 'T003', name: 'General_TK_Analysis_Protocol', version: 'v1.1-draft', species: ['All'], regulation: 'OECD', status: 'Draft', lastModified: '2026-01-20', author: 'Li Ming' },
    { id: 'T004', name: 'Immunogenicity_Assay_Report', version: 'v2.0', species: ['Humanized Mice'], regulation: 'FDA', status: 'Reviewing', lastModified: '2026-01-18', author: 'Quality_QA' },
];

interface TemplateListViewProps {
    onNavigate: (view: string, params?: any) => void;
}

const TemplateListView: React.FC<TemplateListViewProps> = ({ onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterReg, setFilterReg] = useState<string>('All');

    const filteredTemplates = MOCK_TEMPLATES.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesReg = filterReg === 'All' || t.regulation === filterReg;
        return matchesSearch && matchesReg;
    });

    const StatusBadge = ({ status }: { status: Template['status'] }) => {
        let color = '#666';
        let bg = '#eee';
        if (status === 'Published') { color = 'var(--color-status-pass)'; bg = 'var(--color-status-pass-bg)'; }
        if (status === 'Draft') { color = 'var(--color-text-secondary)'; bg = 'var(--color-bg-canvas)'; }
        if (status === 'Reviewing') { color = 'var(--color-status-warn)'; bg = 'var(--color-status-warn-bg)'; }

        return (
            <span style={{
                padding: '2px 8px', borderRadius: '12px', fontSize: 'var(--text-xs)', fontWeight: 'bold',
                color, backgroundColor: bg, border: `1px solid ${color}33`
            }}>
                {status}
            </span>
        );
    };

    return (
        <div style={{ padding: 'var(--space-8)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>Standard Library</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                        Manage report templates, data contracts, and narrative assets.
                    </p>
                </div>
                <button
                    style={{
                        padding: 'var(--space-3) var(--space-6)', backgroundColor: 'var(--color-primary)', color: 'white',
                        border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)'
                    }}
                >
                    <span>+</span> New Template
                </button>
            </div>

            {/* Toolbar */}
            <div style={{
                padding: 'var(--space-4)', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)'
            }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0 var(--space-3)' }}>
                    <span>🔍</span>
                    <input
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ border: 'none', padding: 'var(--space-2)', outline: 'none', width: '100%', fontSize: 'var(--text-sm)' }}
                    />
                </div>
                <select
                    value={filterReg}
                    onChange={e => setFilterReg(e.target.value)}
                    style={{ padding: '0 var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'white' }}
                >
                    <option value="All">All Regulations</option>
                    <option value="FDA">FDA 21 CFR</option>
                    <option value="NMPA">NMPA 2020</option>
                    <option value="OECD">OECD GLP</option>
                </select>
            </div>

            {/* Table */}
            <div style={{
                flex: 1, backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Table Header */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 1.5fr 1fr 1.5fr 1fr',
                    padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-bg-canvas)', borderBottom: '1px solid var(--color-border)',
                    fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase'
                }}>
                    <div>Template Name</div>
                    <div>Version</div>
                    <div>Species / Matrix</div>
                    <div>Regulation</div>
                    <div>Status</div>
                    <div>Last Modified</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {/* Table Rows */}
                <div style={{ overflowY: 'auto' }}>
                    {filteredTemplates.map(t => (
                        <div
                            key={t.id}
                            style={{
                                display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 1.5fr 1fr 1.5fr 1fr',
                                padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', alignItems: 'center',
                                transition: 'background-color 0.2s', cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-canvas)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            onClick={() => onNavigate('library_detail', { id: t.id })}
                        >
                            <div style={{ fontWeight: '500', color: 'var(--color-text-main)' }}>{t.name}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{t.version}</div>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {t.species.map(s => (
                                    <span key={s} style={{ fontSize: '10px', padding: '1px 6px', backgroundColor: '#f3f4f6', borderRadius: '4px', border: '1px solid #e5e7eb' }}>{s}</span>
                                ))}
                            </div>
                            <div style={{ fontSize: 'var(--text-sm)' }}>{t.regulation}</div>
                            <div><StatusBadge status={t.status} /></div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                                {t.lastModified}<br />by {t.author}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2em' }}>⋯</button>
                            </div>
                        </div>
                    ))}

                    {filteredTemplates.length === 0 && (
                        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                            No templates found matching your filters.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateListView;
