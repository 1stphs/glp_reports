
import React, { useReducer } from 'react';
import { useStudy } from '../../../contexts/StudyContext';

// --- State Management ---
type WizardStep = 'basics' | 'assets' | 'compliance' | 'ingestion';

interface WizardState {
    step: WizardStep;
    studyId: string;
    protocolId: string;
    isCompliant: boolean;
    uploadProgress: number;
}

type Action =
    | { type: 'NEXT_STEP' }
    | { type: 'SET_FIELD'; field: keyof WizardState; value: any }
    | { type: 'START_UPLOAD' }
    | { type: 'UPLOAD_TICK' };

const initialState: WizardState = {
    step: 'basics',
    studyId: 'FOXU-2026-BIO-NEW',
    protocolId: 'PROT-v2.1',
    isCompliant: false,
    uploadProgress: 0
};

const reducer = (state: WizardState, action: Action): WizardState => {
    switch (action.type) {
        case 'NEXT_STEP':
            const steps: WizardStep[] = ['basics', 'assets', 'compliance', 'ingestion'];
            const idx = steps.indexOf(state.step);
            return { ...state, step: steps[idx + 1] || 'basics' };
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'START_UPLOAD':
            return { ...state, uploadProgress: 10 };
        case 'UPLOAD_TICK':
            return { ...state, uploadProgress: Math.min(state.uploadProgress + 20, 100) };
        default:
            return state;
    }
};

interface StudyWizardProps {
    onComplete: (studyId: string) => void;
    onCancel: () => void;
}

const StudyWizard: React.FC<StudyWizardProps> = ({ onComplete, onCancel }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { dispatch: globalDispatch } = useStudy();

    const handleNext = () => {
        if (state.step === 'ingestion') {
            globalDispatch({ type: 'SET_STUDY', payload: state.studyId });
            onComplete(state.studyId);
        } else if (state.step === 'compliance') {
            // Trigger simulated upload on entering ingestion
            dispatch({ type: 'NEXT_STEP' });
            dispatch({ type: 'START_UPLOAD' });
            const interval = setInterval(() => {
                dispatch({ type: 'UPLOAD_TICK' });
            }, 500);
            setTimeout(() => clearInterval(interval), 3000);
        } else {
            dispatch({ type: 'NEXT_STEP' });
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 'var(--z-modal)'
        }}>
            <div style={{
                backgroundColor: 'var(--color-bg-surface)',
                width: '600px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-float)',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>Create New Study Analysis</h2>
                    <div style={{ display: 'flex', marginTop: 'var(--space-4)', gap: 'var(--space-2)' }}>
                        {['Basics', 'Assets', 'Compliance', 'Ingestion'].map((label, idx) => {
                            const currentIdx = ['basics', 'assets', 'compliance', 'ingestion'].indexOf(state.step);
                            const isActive = idx <= currentIdx;
                            return (
                                <div key={label} style={{ flex: 1, height: '4px', backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-border)', borderRadius: '2px' }} />
                            );
                        })}
                    </div>
                    <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                        Step: {state.step.toUpperCase()}
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: 'var(--space-8)', minHeight: '300px' }}>
                    {state.step === 'basics' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Study ID</label>
                            <input
                                value={state.studyId}
                                onChange={e => dispatch({ type: 'SET_FIELD', field: 'studyId', value: e.target.value })}
                                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                    )}

                    {state.step === 'assets' && (
                        <div>
                            <div style={{ padding: 'var(--space-4)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem' }}>📂</div>
                                <p>Drag & Drop Protocol PDF or Raw Data Excel</p>
                            </div>
                            <div style={{ marginTop: 'var(--space-4)' }}>
                                <div><strong>Detected:</strong> {state.protocolId}</div>
                            </div>
                        </div>
                    )}

                    {state.step === 'compliance' && (
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={state.isCompliant}
                                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'isCompliant', value: e.target.checked })}
                                    style={{ width: '1.25rem', height: '1.25rem' }}
                                />
                                <span>I certify this study follows GLP/GCP Standard v2026.</span>
                            </label>
                        </div>
                    )}

                    {state.step === 'ingestion' && (
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ marginBottom: 'var(--space-4)' }}>Ingesting Data...</h3>
                            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${state.uploadProgress}%`, height: '100%', backgroundColor: 'var(--color-brand-primary)', transition: 'width 0.3s' }} />
                            </div>
                            <div style={{ marginTop: 'var(--space-2)' }}>{state.uploadProgress}%</div>

                            {state.uploadProgress === 100 && (
                                <div style={{ marginTop: 'var(--space-4)', color: 'var(--color-status-pass)' }}>
                                    ✓ Ingestion Complete. Ready to analyze.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-canvas)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)' }}>
                    <button onClick={onCancel} style={{ padding: 'var(--space-2) var(--space-4)', border: 'none', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
                    <button
                        onClick={handleNext}
                        disabled={state.step === 'compliance' && !state.isCompliant}
                        style={{
                            padding: 'var(--space-2) var(--space-6)',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            opacity: (state.step === 'compliance' && !state.isCompliant) ? 0.5 : 1,
                            cursor: 'pointer'
                        }}
                    >
                        {state.step === 'ingestion' ? (state.uploadProgress === 100 ? 'Go to Dashboard' : 'Processing...') : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudyWizard;
