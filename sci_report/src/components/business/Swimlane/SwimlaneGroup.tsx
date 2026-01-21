
import React, { useState, useMemo } from 'react';
import type { StudyTask } from '../../../services/mock/study.mock';

interface SwimlaneGroupProps {
    title: string;
    tasks: StudyTask[];
    defaultExpanded?: boolean;
}

const SwimlaneGroup: React.FC<SwimlaneGroupProps> = ({ title, tasks, defaultExpanded = true }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Status aggregation logic
    const summary = useMemo(() => {
        let critical = 0;
        let warning = 0;
        let healthy = 0;

        tasks.forEach(t => {
            if (t.status === 'critical') critical++;
            else if (t.status === 'warning') warning++;
            else if (t.status === 'healthy') healthy++;
        });

        return { critical, warning, healthy, total: tasks.length };
    }, [tasks]);

    // Determine header color based on worst status
    const headerStatusColor = summary.critical > 0
        ? 'var(--color-status-fail)'
        : summary.warning > 0
            ? 'var(--color-status-warn)'
            : 'var(--color-text-secondary)';

    return (
        <div style={{
            marginBottom: 'var(--space-4)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: 'var(--color-bg-surface)'
        }}>
            {/* Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-bg-canvas)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderLeft: `4px solid ${headerStatusColor}`
                }}
            >
                <div style={{ fontWeight: 'bold' }}>{title}</div>

                <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                    {summary.critical > 0 && (
                        <span style={{ color: 'var(--color-status-fail)', fontWeight: 'bold' }}>
                            {summary.critical} CRITICAL
                        </span>
                    )}
                    {summary.warning > 0 && (
                        <span style={{ color: 'var(--color-status-warn)', fontWeight: 'bold' }}>
                            {summary.warning} WARN
                        </span>
                    )}
                    <span style={{ color: 'var(--color-text-tertiary)' }}>
                        {summary.healthy} / {summary.total} Done
                    </span>
                    <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        ▼
                    </span>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div style={{ padding: 'var(--space-4)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            style={{
                                padding: 'var(--space-3)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: task.status === 'locked' ? 'var(--color-bg-canvas)' : 'white',
                                opacity: task.status === 'locked' ? 0.6 : 1,
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)',
                                width: '8px', height: '8px', borderRadius: '50%',
                                backgroundColor:
                                    task.status === 'critical' ? 'var(--color-status-fail)' :
                                        task.status === 'warning' ? 'var(--color-status-warn)' :
                                            task.status === 'healthy' ? 'var(--color-status-pass)' :
                                                'var(--color-text-tertiary)'
                            }} />

                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: '500', marginBottom: 'var(--space-1)' }}>
                                {task.title}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                                Confidence: {task.confidence}%
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SwimlaneGroup;
