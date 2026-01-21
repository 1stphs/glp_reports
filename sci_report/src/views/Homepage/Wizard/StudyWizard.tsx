
import React, { useReducer } from 'react';
import { useStudy } from '../../../contexts/StudyContext';

// --- State Management ---
type WizardStep = 'basics' | 'assignment' | 'compliance' | 'ingestion';

interface WizardState {
    step: WizardStep;
    // Step 1: Basics
    studyId: string;
    projectCode: string;
    // Step 2: Assignment
    agentId: string;
    templateId: string;
    // Step 3: Compliance
    standard: 'FDA 21 CFR' | 'NMPA 2020';
    allowTechnicalExclusion: boolean;
    // Step 4: Ingestion
    uploadProgress: number;
}

type Action =
    | { type: 'NEXT_STEP' }
    | { type: 'PREV_STEP' }
    | { type: 'SET_FIELD'; field: keyof WizardState; value: any }
    | { type: 'START_UPLOAD' }
    | { type: 'UPLOAD_TICK' };

const initialState: WizardState = {
    step: 'basics',
    studyId: 'FOXU-2026-BIO-NEW',
    projectCode: 'PROJ-Alpha',
    agentId: 'BioAnalyst-Pro v2.1',
    templateId: 'NMPA_PK_Report_Template_v5',
    standard: 'NMPA 2020',
    allowTechnicalExclusion: false,
    uploadProgress: 0
};

const reducer = (state: WizardState, action: Action): WizardState => {
    switch (action.type) {
        case 'NEXT_STEP':
            const steps: WizardStep[] = ['basics', 'assignment', 'compliance', 'ingestion'];
            const idx = steps.indexOf(state.step);
            return { ...state, step: steps[idx + 1] || 'basics' };
        case 'PREV_STEP':
            const stepsPrev: WizardStep[] = ['basics', 'assignment', 'compliance', 'ingestion'];
            const idxPrev = stepsPrev.indexOf(state.step);
            return { ...state, step: stepsPrev[idxPrev - 1] || 'basics' };
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
                width: '700px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-float)',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>Create New Study Analysis</h2>
                    <div style={{ display: 'flex', marginTop: 'var(--space-4)', gap: 'var(--space-2)' }}>
                        {['Basics', 'Assignment', 'Compliance', 'Ingestion'].map((label, idx) => {
                            const stepKeys: WizardStep[] = ['basics', 'assignment', 'compliance', 'ingestion'];
                            const currentIdx = stepKeys.indexOf(state.step);
                            const isActive = idx <= currentIdx;
                            return (
                                <div key={label} style={{ flex: 1, height: '4px', backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-border)', borderRadius: '2px' }} />
                            );
                        })}
                    </div>
                    <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                        Step {['basics', 'assignment', 'compliance', 'ingestion'].indexOf(state.step) + 1}: {state.step.toUpperCase()}
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: 'var(--space-8)', minHeight: '350px' }}>
                    {/* Step 1: Basics */}
                    {state.step === 'basics' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Study ID</label>
                                <input
                                    value={state.studyId}
                                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'studyId', value: e.target.value })}
                                    style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Project Code</label>
                                <input
                                    value={state.projectCode}
                                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'projectCode', value: e.target.value })}
                                    style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Assignment */}
                    {state.step === 'assignment' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Digital Expert (Agent)</label>
                                <select
                                    value={state.agentId}
                                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'agentId', value: e.target.value })}
                                    style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                >
                                    <option>BioAnalyst-Pro v2.1</option>
                                    <option>ToxExpert-Lite v1.0</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Report Template</label>
                                <select
                                    value={state.templateId}
                                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'templateId', value: e.target.value })}
                                    style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                >
                                    <option>NMPA_PK_Report_Template_v5</option>
                                    <option>FDA_Tox_Report_Template_v3</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Compliance */}
                    {state.step === 'compliance' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Regulation Standard</label>
                                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                                    <label style={{ padding: 'var(--space-3)', border: state.standard === 'NMPA 2020' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', flex: 1 }}>
                                        <input
                                            type="radio"
                                            name="standard"
                                            value="NMPA 2020"
                                            checked={state.standard === 'NMPA 2020'}
                                            onChange={() => dispatch({ type: 'SET_FIELD', field: 'standard', value: 'NMPA 2020' })}
                                            style={{ marginRight: 'var(--space-2)' }}
                                        />
                                        NMPA 2020 (China)
                                    </label>
                                    <label style={{ padding: 'var(--space-3)', border: state.standard === 'FDA 21 CFR' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', flex: 1 }}>
                                        <input
                                            type="radio"
                                            name="standard"
                                            value="FDA 21 CFR"
                                            checked={state.standard === 'FDA 21 CFR'}
                                            onChange={() => dispatch({ type: 'SET_FIELD', field: 'standard', value: 'FDA 21 CFR' })}
                                            style={{ marginRight: 'var(--space-2)' }}
                                        />
                                        FDA 21 CFR Part 11
                                    </label>
                                </div>
                            </div>

                            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-canvas)', borderRadius: 'var(--radius-md)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={state.allowTechnicalExclusion}
                                        onChange={e => dispatch({ type: 'SET_FIELD', field: 'allowTechnicalExclusion', value: e.target.checked })}
                                        style={{ width: '1.25rem', height: '1.25rem' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: '500' }}>Allow Technical Exclusion</div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                                            Enables "Reasoned Exclusion" workflow for outlier data points. Requires QA approval.
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Ingestion */}
                    {state.step === 'ingestion' && (
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ marginBottom: 'var(--space-4)' }}>Ingesting Data Bundle...</h3>
                            <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', border: '1px dashed var(--color-border)', color: 'var(--color-text-secondary)' }}>
                                Target: {state.studyId} <br />
                                Standard: {state.standard}
                            </div>
                            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${state.uploadProgress}%`, height: '100%', backgroundColor: 'var(--color-brand-primary)', transition: 'width 0.3s' }} />
                            </div>
                            <div style={{ marginTop: 'var(--space-2)' }}>{state.uploadProgress}%</div>

                            {state.uploadProgress === 100 && (
                                <div style={{ marginTop: 'var(--space-4)', color: 'var(--color-status-pass)', fontWeight: 'bold' }}>
                                    ✓ Ingestion Complete. Ready to analyze.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-canvas)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                    <button onClick={onCancel} style={{ padding: 'var(--space-2) var(--space-4)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>Cancel</button>

                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        {state.step !== 'basics' && state.step !== 'ingestion' && (
                            <button
                                onClick={() => dispatch({ type: 'PREV_STEP' })}
                                style={{ padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--color-border)', background: 'white', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                            >
                                Back
                            </button>
                        )}

                        <button
                            onClick={handleNext}
                            style={{
                                padding: 'var(--space-2) var(--space-6)',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer'
                            }}
                        >
                            {state.step === 'ingestion' ? (state.uploadProgress === 100 ? 'Go to Dashboard' : 'Processing...') : 'Next →'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyWizard;
