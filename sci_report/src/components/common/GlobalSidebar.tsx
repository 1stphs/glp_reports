
import React from 'react';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
}

const GlobalSidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {

    const MenuItem = ({ id, icon, label, isHeader = false }: { id?: string, icon?: string, label: string, isHeader?: boolean }) => {
        if (isHeader) {
            return <div style={{
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--text-xs)', fontWeight: 'bold',
                color: 'var(--color-text-tertiary)', textTransform: 'uppercase',
                marginTop: 'var(--space-4)'
            }}>{label}</div>;
        }

        const isActive = currentView === id;
        return (
            <div
                onClick={() => id && onNavigate(id)}
                style={{
                    padding: 'var(--space-2) var(--space-4)',
                    margin: '0 var(--space-2)',
                    fontSize: 'var(--text-sm)',
                    color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                    backgroundColor: isActive ? '#e0e7ff' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    fontWeight: isActive ? '500' : '400'
                }}
            >
                <span style={{ fontSize: '1.2em' }}>{icon}</span>
                {label}
            </div>
        );
    };

    return (
        <div style={{
            width: '240px', height: '100%',
            borderRight: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-surface-elevated)',
            display: 'flex', flexDirection: 'column', padding: 'var(--space-4) 0'
        }}>
            <MenuItem label="Workspaces" isHeader />
            <MenuItem id="home" icon="🏠" label="Home" />
            <MenuItem id="archives" icon="📂" label="Archives" />

            <MenuItem label="Knowledge Assets" isHeader />
            <MenuItem id="library" icon="📘" label="SOPs & Templates" />
            <MenuItem id="engine" icon="🧠" label="Logic Engines" />
            <MenuItem id="prompts" icon="📝" label="Few-shot Bank" />

            <MenuItem label="System" isHeader />
            <MenuItem id="audit" icon="🛡️" label="Audit Log" />
            <MenuItem id="settings" icon="⚙️" label="Settings" />
        </div>
    );
};

export default GlobalSidebar;
