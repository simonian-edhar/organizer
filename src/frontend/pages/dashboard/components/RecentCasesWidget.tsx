import React from 'react';
import { RecentCase } from '../../../types/dashboard.types';

interface RecentCasesWidgetProps {
    cases: RecentCase[];
}

export const RecentCasesWidget: React.FC<RecentCasesWidgetProps> = ({ cases }) => {
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'Активна': '#10b981',
            'Чернетка': '#6b7280',
            'Призупинена': '#f59e0b',
            'Закрита': '#3b82f6',
            'Архівна': '#6b7280',
        };
        return colors[status] || '#6b7280';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            'Низький': '#10b981',
            'Середній': '#f59e0b',
            'Високий': '#ef4444',
            'Терміновий': '#dc2626',
        };
        return colors[priority] || '#6b7280';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    if (cases.length === 0) {
        return (
            <div className="widget recent-cases-widget">
                <div className="widget-header">
                    <h3 className="widget-title">Останні справи</h3>
                </div>
                <div className="widget-empty">
                    <p>Немає справ для відображення</p>
                </div>
            </div>
        );
    }

    return (
        <div className="widget recent-cases-widget">
            <div className="widget-header">
                <h3 className="widget-title">Останні справи</h3>
                <span className="widget-count">{cases.length}</span>
            </div>
            <div className="widget-content">
                {cases.map((caseItem) => (
                    <div key={caseItem.id} className="case-item">
                        <div className="case-item-header">
                            <span className="case-number">{caseItem.caseNumber}</span>
                            <div className="case-badges">
                                <span
                                    className="badge badge-status"
                                    style={{ backgroundColor: getStatusColor(caseItem.status) }}
                                >
                                    {caseItem.status}
                                </span>
                                <span
                                    className="badge badge-priority"
                                    style={{ backgroundColor: getPriorityColor(caseItem.priority) }}
                                >
                                    {caseItem.priority}
                                </span>
                            </div>
                        </div>
                        <div className="case-item-title">{caseItem.title}</div>
                        <div className="case-item-footer">
                            <span className="case-client">{caseItem.clientName}</span>
                            <span className="case-date">
                                {formatDate(caseItem.nextHearingDate)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
