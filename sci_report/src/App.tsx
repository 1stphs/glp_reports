import React from 'react';
import { StudyProvider } from './contexts/StudyContext';
import CellDetailView from './views/CellDetail/CellDetailView';
import ControlCenterView from './views/ControlCenter/ControlCenterView';
import HomepageView from './views/Homepage/HomepageView';
import './styles/variables.css';

// Placeholder for main layout
const MainLayout = ({ children, onHome }: { children: React.ReactNode, onHome: () => void }) => (
  <div style={{
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg-canvas)',
    color: 'var(--color-text-main)',
    fontFamily: 'var(--font-sans)'
  }}>
    <nav style={{
      height: '60px', borderBottom: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center', padding: '0 var(--space-6)',
      backgroundColor: 'var(--color-bg-surface)'
    }}>
      <div onClick={onHome} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ fontWeight: 'bold', fontSize: 'var(--text-lg)', color: 'var(--color-brand-primary)' }}>GLP In Silico</span>
        <span style={{ fontSize: 'var(--text-xs)', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: 'bold' }}>Foxu.AI</span>
      </div>
    </nav>
    {children}
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = React.useState<'home' | 'control' | 'detail'>('home');

  return (
    <StudyProvider>
      <MainLayout onHome={() => setCurrentView('home')}>

        {/* Navigation Sub-Header (Only visible inside app) */}
        {currentView !== 'home' && (
          <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'white', display: 'flex', gap: 'var(--space-4)' }}>
            <button
              onClick={() => setCurrentView('control')}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                fontWeight: 'bold',
                color: currentView === 'control' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                border: 'none', background: 'none', cursor: 'pointer'
              }}
            >
              Control Center
            </button>
            <button
              onClick={() => setCurrentView('detail')}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                fontWeight: 'bold',
                color: currentView === 'detail' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                border: 'none', background: 'none', cursor: 'pointer'
              }}
            >
              Cell Detail
            </button>
          </div>
        )}

        {currentView === 'home' && <HomepageView onNavigate={(view) => setCurrentView(view)} />}
        {currentView === 'control' && <ControlCenterView />}
        {currentView === 'detail' && <CellDetailView />}
      </MainLayout>
    </StudyProvider>
  );
};

export default App;
