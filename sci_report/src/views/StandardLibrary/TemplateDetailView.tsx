
import React, { useState, useEffect } from 'react';
import DataContractEditor from './components/DataContractEditor';
import FewShotManager from './components/FewShotManager';
import FormatPreview from './components/FormatPreview';
import TemplateChapterTree, { type ChapterNode } from './components/TemplateChapterTree';
import templatesData from '../../services/mock/auto_generated_templates.json';

interface TemplateDetailProps {
    onNavigate: (view: string, params?: any) => void;
    templateId?: string;
}

const TemplateDetailView: React.FC<TemplateDetailProps> = ({ onNavigate, templateId }) => {
    // Find template by ID, or fallback to index 1 (which has variables) for better demo experience
    const activeTemplate = templatesData.find(t => t.id === templateId) || templatesData[1] || templatesData[0];
    const [activeChapterId, setActiveChapterId] = useState<string>('CH-001');
    const [activeChapterTitle, setActiveChapterTitle] = useState<string>('Overview');

    // Default chapters if none exist
    const chapters: ChapterNode[] = (activeTemplate.chapters as ChapterNode[]) || [
        { id: "CH-001", title: "1. 摘要 (Summary)", type: "section" },
        { id: "CH-002", title: "2. 引言 (Introduction)", type: "section" }
    ];

    useEffect(() => {
        if (chapters && chapters.length > 0) {
            setActiveChapterId(chapters[0].id);
            setActiveChapterTitle(chapters[0].title);
        }
    }, [activeTemplate]); // Reset when template changes

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div style={{
                height: '60px', padding: '0 var(--space-6)', borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <button
                        onClick={() => onNavigate('library')}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 'var(--text-lg)' }}
                    >
                        ←
                    </button>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{activeTemplate.name} <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{activeTemplate.version}</span></div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Last edited today</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-status-pass)' }}>
                        ● Saved
                    </span>
                    <button style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer' }}>
                        Diff
                    </button>
                    <button style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer' }}>
                        Publish v2.0
                    </button>
                </div>
            </div>

            {/* Main Content Area: Sidebar + Tri-Fold Editor */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* 1. Left Rail: Chapter Backbone */}
                <div style={{ width: '250px', flexShrink: 0 }}>
                    <TemplateChapterTree
                        chapters={chapters}
                        activeChapterId={activeChapterId}
                        onSelectChapter={(id, title) => {
                            setActiveChapterId(id);
                            setActiveChapterTitle(title);
                        }}
                    />
                </div>

                {/* 2. Right Area: Tri-Fold Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-canvas)' }}>
                    {/* Chapter Header */}
                    <div style={{ padding: 'var(--space-3) var(--space-6)', borderBottom: '1px solid var(--color-border)', backgroundColor: '#fff', fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>
                        {activeChapterTitle}
                    </div>

                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1.3fr', overflow: 'hidden' }}>
                        {/* A. Data Contract */}
                        <div style={{ overflow: 'hidden' }}>
                            <DataContractEditor template={activeTemplate} />
                        </div>

                        {/* B. Few-Shots */}
                        <div style={{ overflow: 'hidden' }}>
                            <FewShotManager />
                        </div>

                        {/* C. Format */}
                        <div style={{ overflow: 'hidden' }}>
                            <FormatPreview />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateDetailView;
