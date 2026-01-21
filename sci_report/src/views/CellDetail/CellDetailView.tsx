import React, { useState, useRef, useEffect } from 'react';
import { useStudy } from '../../contexts/StudyContext';
import { mockService } from '../../services/mockAdapter';
import type { CellData } from '../../services/mock/cell.mock';
import P1_DataMapping from '../../components/business/FlowPanel/P1_DataMapping';
import P2_LogicCheck from '../../components/business/FlowPanel/P2_LogicCheck';
import P3_Drafting from '../../components/business/FlowPanel/P3_Drafting';
import P4_SignOff from '../../components/business/FlowPanel/P4_SignOff';

const CellDetailView: React.FC = () => {
    const { state } = useStudy();
    const [cellData, setCellData] = useState<CellData | null>(null);
    const [activePhase, setActivePhase] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P1');

    // Panel Refs for scroll spy - simple implementation
    const p1Ref = useRef<HTMLDivElement>(null);
    const p2Ref = useRef<HTMLDivElement>(null);
    const p3Ref = useRef<HTMLDivElement>(null);
    const p4Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load mock data on mount
        const loadData = async () => {
            const data = await mockService.getCellDetail(state.currentStudyId || 'def', 'cell_01');
            setCellData(data);
        };
        loadData();
    }, [state.currentStudyId]);

    const scrollToPhase = (phase: 'P1' | 'P2' | 'P3' | 'P4') => {
        setActivePhase(phase);
        // Safe ref access
        const ref = phase === 'P1' ? p1Ref : phase === 'P2' ? p2Ref : phase === 'P3' ? p3Ref : p4Ref;
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (!cellData) return <div>Loading Cell Data...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '200px' }}>
            <header style={{
                marginBottom: 'var(--space-8)',
                position: 'sticky', top: 0, zIndex: 'var(--z-sticky)',
                backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                padding: 'var(--space-4) 0', borderBottom: '1px solid var(--color-border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                            {cellData.chapter_metadata.study_id} / {cellData.chapter_metadata.analyte_name}
                        </div>
                        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>
                            {cellData.chapter_metadata.chapter_id.replace(/_/g, ' ')}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {(['P1', 'P2', 'P3', 'P4'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => scrollToPhase(p)}
                                style={{
                                    padding: 'var(--space-2) var(--space-4)',
                                    borderRadius: 'var(--radius-full)',
                                    border: 'none',
                                    backgroundColor: activePhase === p ? 'var(--color-primary)' : 'var(--color-bg-canvas)',
                                    color: activePhase === p ? 'white' : 'var(--color-text-secondary)',
                                    cursor: 'pointer'
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* P1 Section */}
            <section ref={p1Ref} style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{
                    border: activePhase === 'P1' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    transition: 'border-color 0.3s'
                }}>
                    <div
                        onClick={() => setActivePhase('P1')}
                        style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-canvas)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        P1: Data Source
                    </div>

                    <P1_DataMapping
                        data={cellData.analytical_runs}
                        isExpanded={activePhase === 'P1'}
                        onContinue={() => scrollToPhase('P2')}
                    />
                </div>
            </section>

            {/* P2 Placeholder */}
            <section ref={p2Ref} style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{
                    border: activePhase === 'P2' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    opacity: ['P1'].includes(activePhase) ? 0.5 : 1 // Dim if not reached
                }}>
                    <div
                        onClick={() => setActivePhase('P2')}
                        style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-canvas)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        P2: Logic & Calculation
                    </div>

                    <P2_LogicCheck
                        isExpanded={activePhase === 'P2' || activePhase === 'P3' || activePhase === 'P4'}
                        onContinue={() => scrollToPhase('P3')}
                    />
                </div>
            </section>

            {/* P3 Placeholder */}
            <section ref={p3Ref} style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{
                    border: activePhase === 'P3' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    opacity: ['P1', 'P2'].includes(activePhase) ? 0.5 : 1
                }}>
                    <div
                        onClick={() => setActivePhase('P3')}
                        style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-canvas)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        P3: Narrative Generation
                    </div>

                    <P3_Drafting
                        isExpanded={activePhase === 'P3' || activePhase === 'P4'}
                        onContinue={() => scrollToPhase('P4')}
                    />
                </div>
            </section>

            {/* P4 Placeholder */}
            <section ref={p4Ref} style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{
                    border: activePhase === 'P4' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    opacity: ['P1', 'P2', 'P3'].includes(activePhase) ? 0.5 : 1
                }}>
                    <div
                        onClick={() => setActivePhase('P4')}
                        style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-canvas)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        P4: Sign Off
                    </div>

                    <P4_SignOff isExpanded={activePhase === 'P4'} />
                </div>
            </section>

        </div>
    );
};

export default CellDetailView;
