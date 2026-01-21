
import React from 'react';

export interface ChapterNode {
    id: string;
    title: string;
    type?: 'section' | 'subsection';
    children?: ChapterNode[];
}

interface TemplateChapterTreeProps {
    chapters: ChapterNode[];
    activeChapterId: string;
    onSelectChapter: (id: string, title: string) => void;
}

const TemplateChapterTree: React.FC<TemplateChapterTreeProps> = ({ chapters, activeChapterId, onSelectChapter }) => {
    // Simple recursive rendering
    const renderTree = (nodes: ChapterNode[], level = 0) => {
        return nodes.map(node => (
            <div key={node.id}>
                <div
                    onClick={() => onSelectChapter(node.id, node.title)}
                    style={{
                        padding: `8px 12px 8px ${12 + level * 16}px`,
                        cursor: 'pointer',
                        backgroundColor: activeChapterId === node.id ? '#e6f7ff' : 'transparent',
                        borderRight: activeChapterId === node.id ? '2px solid var(--color-primary)' : 'none',
                        color: activeChapterId === node.id ? 'var(--color-primary)' : 'var(--color-text-main)',
                        fontSize: 'var(--text-sm)',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <span style={{ fontSize: '10px' }}>{node.children && node.children.length > 0 ? '▼' : '•'}</span>
                    {node.title}
                </div>
                {node.children && renderTree(node.children, level + 1)}
            </div>
        ));
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto', borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-body)' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', fontWeight: 'bold' }}>
                Chapter Backbone
            </div>
            <div style={{ padding: 'var(--space-2) 0' }}>
                {renderTree(chapters)}
            </div>
            <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
                <button style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px dashed #ccc', background: 'white', cursor: 'pointer' }}>+ Add Chapter</button>
            </div>
        </div>
    );
};

export default TemplateChapterTree;
