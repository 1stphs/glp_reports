
import React from 'react';
import { StudyProvider } from './contexts/StudyContext';
import CellDetailView from './views/CellDetail/CellDetailView';
import ControlCenterView from './views/ControlCenter/ControlCenterView';
import HomepageView from './views/Homepage/HomepageView';
import StudyDashboard from './views/Homepage/Dashboard/StudyDashboard';
import TemplateListView from './views/StandardLibrary/TemplateListView';
import TemplateDetailView from './views/StandardLibrary/TemplateDetailView';
import GlobalSidebar from './components/common/GlobalSidebar';
import './styles/variables.css';

// Placeholder for main layout
const MainLayout = ({ children, onHome, currentView, onNavigate }: {
  children: React.ReactNode,
  onHome: () => void,
  currentView: string,
  onNavigate: (view: string) => void
}) => (
  <div style={{
    height: '100vh',
    backgroundColor: 'var(--color-bg-canvas)',
    color: 'var(--color-text-main)',
    fontFamily: 'var(--font-sans)',
    display: 'flex', flexDirection: 'column'
  }}>
    <nav style={{
      height: '60px', borderBottom: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center', padding: '0 var(--space-6)',
      backgroundColor: 'var(--color-bg-surface)', flexShrink: 0
    }}>
      <div onClick={onHome} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ fontWeight: 'bold', fontSize: 'var(--text-lg)', color: 'var(--color-brand-primary)' }}>GLP In Silico</span>
        <span style={{ fontSize: 'var(--text-xs)', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: 'bold' }}>Foxu.AI</span>
      </div>
    </nav>

    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <GlobalSidebar currentView={currentView} onNavigate={onNavigate} />
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {children}
      </main>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = React.useState<'home' | 'dashboard' | 'control' | 'detail' | 'library' | 'library_detail'>('home');
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | undefined>(undefined);

  return (
    <StudyProvider>
      <MainLayout
        onHome={() => setCurrentView('home')}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as any)}
      >

        {currentView === 'home' && <HomepageView onNavigate={(view) => setCurrentView(view)} />}
        {currentView === 'dashboard' && <StudyDashboard onNavigate={(view) => setCurrentView(view)} />}
        {currentView === 'library' && <TemplateListView onNavigate={(view, params) => {
          setCurrentView(view as any);
          if (params && params.id) setSelectedTemplateId(params.id);
        }} />}
        {currentView === 'library_detail' && <TemplateDetailView
          templateId={selectedTemplateId}
          onNavigate={(view) => setCurrentView(view as any)}
        />}
        {currentView === 'control' && <ControlCenterView />}
        {currentView === 'detail' && <CellDetailView />}
      </MainLayout>
    </StudyProvider>
  );
};

export default App;
