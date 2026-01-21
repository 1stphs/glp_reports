
import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

// --- Types ---
export interface StudyState {
    currentStudyId: string | null;
    currentPhase: 'P1' | 'P2' | 'P3' | 'P4';
    isDemoMode: boolean;
}

type Action =
    | { type: 'SET_STUDY'; payload: string }
    | { type: 'SET_PHASE'; payload: StudyState['currentPhase'] }
    | { type: 'TOGGLE_DEMO_MODE'; payload: boolean };

// --- Initial State ---
const initialState: StudyState = {
    currentStudyId: 'FOXU-2026-BIO-001',
    currentPhase: 'P1',
    isDemoMode: false,
};

// --- Reducer ---
function studyReducer(state: StudyState, action: Action): StudyState {
    switch (action.type) {
        case 'SET_STUDY':
            return { ...state, currentStudyId: action.payload };
        case 'SET_PHASE':
            return { ...state, currentPhase: action.payload };
        case 'TOGGLE_DEMO_MODE':
            return { ...state, isDemoMode: action.payload };
        default:
            return state;
    }
}

// --- Context ---
const StudyContext = createContext<{
    state: StudyState;
    dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// --- Provider ---
export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(studyReducer, initialState);

    return (
        <StudyContext.Provider value={{ state, dispatch }}>
            {children}
        </StudyContext.Provider>
    );
};

// --- Hook ---
export const useStudy = () => {
    const context = useContext(StudyContext);
    if (!context) {
        throw new Error('useStudy must be used within a StudyProvider');
    }
    return context;
};
