import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import caseService from '../../services/case.service';
import clientService from '../../services/client.service';
import { Case, CaseFilters, CaseType, CaseStatus, CasePriority, TimelineEvent } from '../../types/case.types';
import { Client } from '../../types/client.types';
import { Spinner } from '../../components/Spinner';
import { Alert } from '../../components/Alert';
import './CasesPage.css';

/**
 * Cases List Page
 */
export const CasesPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<CaseFilters>({
        limit: 20,
        page: 1,
        clientId: searchParams.get('clientId') || undefined,
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [showTimeline, setShowTimeline] = useState<string | null>(null);
    const [timelineData, setTimelineData] = useState<TimelineEvent[]>([]);
    const [timelineLoading, setTimelineLoading] = useState(false);

    useEffect(() => {
        loadCases();
    }, [filters]);

    const loadCases = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await caseService.getCases(filters);
            setCases(response.data);
            setTotal(response.total);
            setPage(response.page);
        } catch (err: any) {
            setError(err.message || 'Помилка завантаження справ');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (search: string) => {
        setFilters({ ...filters, search, page: 1 });
    };

    const handleFilterChange = (key: keyof CaseFilters, value: any) => {
        setFilters({ ...filters, [key]: value, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цю справу?')) {
            return;
        }

        try {
            await caseService.deleteCase(id);
            loadCases();
        } catch (err: any) {
            setError(err.message || 'Помилка видалення справи');
        }
    };

    const handleStatusChange = async (id: string, status: CaseStatus) => {
        try {
            await caseService.changeStatus(id, status);
            loadCases();
        } catch (err: any) {
            setError(err.message || 'Помилка зміни статусу');
        }
    };

    const loadTimeline = async (caseId: string) => {
        setTimelineLoading(true);
        try {
            const timeline = await caseService.getCaseTimeline(caseId);
            setTimelineData(timeline);
            setShowTimeline(caseId);
        } catch (err: any) {
            setError(err.message || 'Помилка завантаження timeline');
        } finally {
            setTimelineLoading(false);
        }
    };

    const openCreateModal = () => {
        setSelectedCase(null);
        setShowModal(true);
    };

    const openEditModal = (caseItem: Case) => {
        setSelectedCase(caseItem);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCase(null);
    };

    const handleSave = async () => {
        closeModal();
        loadCases();
    };

    const totalPages = Math.ceil(total / (filters.limit || 20));

    const getStatusBadge = (status: CaseStatus) => {
        const statusClasses: Record<CaseStatus, string> = {
            draft: 'badge-secondary',
            active: 'badge-success',
            on_hold: 'badge-warning',
            closed: 'badge-info',
            archived: 'badge-default',
        };
        const statusLabels: Record<CaseStatus, string> = {
            draft: 'Чернетка',
            active: 'Активна',
            on_hold: 'Призупинена',
            closed: 'Закрита',
            archived: 'Архів',
        };
        return (
            <span className={`badge ${statusClasses[status]}`}>
                {statusLabels[status]}
            </span>
        );
    };

    const getPriorityBadge = (priority: CasePriority) => {
        const priorityClasses: Record<CasePriority, string> = {
            low: 'priority-low',
            medium: 'priority-medium',
            high: 'priority-high',
            urgent: 'priority-urgent',
        };
        const priorityLabels: Record<CasePriority, string> = {
            low: 'Низький',
            medium: 'Середній',
            high: 'Високий',
            urgent: 'Терміновий',
        };
        return (
            <span className={`priority-badge ${priorityClasses[priority]}`}>
                {priorityLabels[priority]}
            </span>
        );
    };

    const getCaseTypeLabel = (type: CaseType): string => {
        const labels: Record<CaseType, string> = {
            civil: 'Цивільна',
            criminal: 'Кримінальна',
            administrative: 'Адміністративна',
            economic: 'Господарська',
            family: 'Сімейна',
            labor: 'Трудова',
            tax: 'Податкова',
            other: 'Інша',
        };
        return labels[type];
    };

    return (
        <div className="cases-page">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Справи</h1>
                    <p className="page-subtitle">Керуйте юридичними справами та відстежуйте прогрес</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Нова справа
                </button>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            <div className="filters-bar">
                <div className="search-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Пошук справ..."
                        value={filters.search || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <select
                    value={filters.caseType || ''}
                    onChange={(e) => handleFilterChange('caseType', e.target.value || undefined)}
                >
                    <option value="">Усі типи</option>
                    <option value="civil">Цивільні</option>
                    <option value="criminal">Кримінальні</option>
                    <option value="administrative">Адміністративні</option>
                    <option value="economic">Господарські</option>
                    <option value="family">Сімейні</option>
                    <option value="labor">Трудові</option>
                    <option value="tax">Податкові</option>
                </select>
                <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                    <option value="">Усі статуси</option>
                    <option value="draft">Чернетки</option>
                    <option value="active">Активні</option>
                    <option value="on_hold">Призупинені</option>
                    <option value="closed">Закриті</option>
                </select>
                <select
                    value={filters.priority || ''}
                    onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                >
                    <option value="">Усі пріоритети</option>
                    <option value="urgent">Термінові</option>
                    <option value="high">Високі</option>
                    <option value="medium">Середні</option>
                    <option value="low">Низькі</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-container">
                    <Spinner size="large" />
                </div>
            ) : cases.length === 0 ? (
                <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <h3>Справ не знайдено</h3>
                    <p>Створіть першу справу, щоб почати роботу</p>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        Нова справа
                    </button>
                </div>
            ) : (
                <>
                    <div className="cases-grid">
                        {cases.map((caseItem) => (
                            <div key={caseItem.id} className="case-card">
                                <div className="case-header">
                                    <div className="case-number">{caseItem.caseNumber}</div>
                                    <div className="case-badges">
                                        {getStatusBadge(caseItem.status)}
                                        {getPriorityBadge(caseItem.priority)}
                                    </div>
                                </div>

                                <h3 className="case-title">
                                    <Link to={`/cases/${caseItem.id}`}>
                                        {caseItem.title || getCaseTypeLabel(caseItem.caseType)}
                                    </Link>
                                </h3>

                                <div className="case-type">{getCaseTypeLabel(caseItem.caseType)}</div>

                                {caseItem.client && (
                                    <div className="case-client">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <Link to={`/clients/${caseItem.client.id}`}>
                                            {caseItem.client.type === 'individual'
                                                ? `${caseItem.client.lastName} ${caseItem.client.firstName}`
                                                : caseItem.client.companyName}
                                        </Link>
                                    </div>
                                )}

                                <div className="case-dates">
                                    {caseItem.deadlineDate && (
                                        <div className="date-item deadline">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            Дедлайн: {new Date(caseItem.deadlineDate).toLocaleDateString('uk-UA')}
                                        </div>
                                    )}
                                    {caseItem.nextHearingDate && (
                                        <div className="date-item hearing">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                            </svg>
                                            Засідання: {new Date(caseItem.nextHearingDate).toLocaleDateString('uk-UA')}
                                        </div>
                                    )}
                                </div>

                                {caseItem.courtName && (
                                    <div className="case-court">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 21h18" />
                                            <path d="M5 21V7l7-4 7 4v14" />
                                            <path d="M9 21v-6h6v6" />
                                        </svg>
                                        {caseItem.courtName}
                                    </div>
                                )}

                                <div className="case-actions">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => loadTimeline(caseItem.id)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="20" x2="12" y2="10" />
                                            <line x1="18" y1="20" x2="18" y2="4" />
                                            <line x1="6" y1="20" x2="6" y2="16" />
                                        </svg>
                                        Timeline
                                    </button>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => openEditModal(caseItem)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Редагувати
                                    </button>
                                    <Link
                                        to={`/documents?caseId=${caseItem.id}`}
                                        className="btn btn-sm btn-secondary"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        Документи
                                    </Link>
                                </div>

                                <div className="case-status-actions">
                                    {caseItem.status === 'draft' && (
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleStatusChange(caseItem.id, 'active')}
                                        >
                                            Активувати
                                        </button>
                                    )}
                                    {caseItem.status === 'active' && (
                                        <>
                                            <button
                                                className="btn btn-sm btn-warning"
                                                onClick={() => handleStatusChange(caseItem.id, 'on_hold')}
                                            >
                                                Призупинити
                                            </button>
                                            <button
                                                className="btn btn-sm btn-info"
                                                onClick={() => handleStatusChange(caseItem.id, 'closed')}
                                            >
                                                Закрити
                                            </button>
                                        </>
                                    )}
                                    {caseItem.status === 'on_hold' && (
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleStatusChange(caseItem.id, 'active')}
                                        >
                                            Відновити
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="btn btn-secondary"
                                disabled={page === 1}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                Попередня
                            </button>
                            <span className="page-info">
                                Сторінка {page} з {totalPages} ({total} записів)
                            </span>
                            <button
                                className="btn btn-secondary"
                                disabled={page === totalPages}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                Наступна
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Timeline Modal */}
            {showTimeline && (
                <TimelineModal
                    caseId={showTimeline}
                    timeline={timelineData}
                    loading={timelineLoading}
                    onClose={() => setShowTimeline(null)}
                />
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <CaseFormModal
                    caseItem={selectedCase}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

/**
 * Timeline Modal Component
 */
interface TimelineModalProps {
    caseId: string;
    timeline: TimelineEvent[];
    loading: boolean;
    onClose: () => void;
}

const TimelineModal: React.FC<TimelineModalProps> = ({ caseId, timeline, loading, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal modal-lg">
                <div className="modal-header">
                    <h2>Timeline справи</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div className="loading-container">
                            <Spinner />
                        </div>
                    ) : timeline.length === 0 ? (
                        <div className="empty-timeline">
                            <p>Немає подій у timeline</p>
                        </div>
                    ) : (
                        <div className="timeline">
                            {timeline.map((event, index) => (
                                <div key={index} className={`timeline-item timeline-${event.type}`}>
                                    <div className="timeline-marker">
                                        {event.type === 'event' ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="timeline-content">
                                        <div className="timeline-date">
                                            {new Date(event.date).toLocaleDateString('uk-UA', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </div>
                                        <div className="timeline-title">
                                            {event.type === 'event' ? event.data.title : event.data.originalName}
                                        </div>
                                        {event.data.description && (
                                            <div className="timeline-description">{event.data.description}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Case Form Modal
 */
interface CaseFormModalProps {
    caseItem: Case | null;
    onClose: () => void;
    onSave: () => void;
}

const CaseFormModal: React.FC<CaseFormModalProps> = ({ caseItem, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [formData, setFormData] = useState({
        caseNumber: caseItem?.caseNumber || '',
        caseType: caseItem?.caseType || 'civil' as CaseType,
        clientId: caseItem?.clientId || '',
        assignedLawyerId: caseItem?.assignedLawyerId || '',
        title: caseItem?.title || '',
        description: caseItem?.description || '',
        priority: caseItem?.priority || 'medium' as CasePriority,
        startDate: caseItem?.startDate ? caseItem.startDate.split('T')[0] : '',
        deadlineDate: caseItem?.deadlineDate ? caseItem.deadlineDate.split('T')[0] : '',
        estimatedAmount: caseItem?.estimatedAmount || 0,
        courtName: caseItem?.courtName || '',
        courtAddress: caseItem?.courtAddress || '',
        judgeName: caseItem?.judgeName || '',
        internalNotes: caseItem?.internalNotes || '',
    });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const response = await clientService.getClients({ limit: 100, status: 'active' });
            setClients(response.data);
        } catch (err) {
            console.error('Failed to load clients:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (caseItem) {
                await caseService.updateCase(caseItem.id, formData);
            } else {
                await caseService.createCase(formData);
            }
            onSave();
        } catch (err: any) {
            setError(err.message || 'Помилка збереження');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal modal-lg">
                <div className="modal-header">
                    <h2>{caseItem ? 'Редагувати справу' : 'Нова справа'}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {error && <Alert type="error" message={error} />}

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Номер справи *</label>
                                <input
                                    type="text"
                                    name="caseNumber"
                                    value={formData.caseNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Тип справи *</label>
                                <select
                                    name="caseType"
                                    value={formData.caseType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="civil">Цивільна</option>
                                    <option value="criminal">Кримінальна</option>
                                    <option value="administrative">Адміністративна</option>
                                    <option value="economic">Господарська</option>
                                    <option value="family">Сімейна</option>
                                    <option value="labor">Трудова</option>
                                    <option value="tax">Податкова</option>
                                    <option value="other">Інша</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Назва справи</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Клієнт *</label>
                                <select
                                    name="clientId"
                                    value={formData.clientId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Оберіть клієнта</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.type === 'individual'
                                                ? `${client.lastName} ${client.firstName}`
                                                : client.companyName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Пріоритет *</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="low">Низький</option>
                                    <option value="medium">Середній</option>
                                    <option value="high">Високий</option>
                                    <option value="urgent">Терміновий</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Опис</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Дата початку</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Дедлайн</label>
                                <input
                                    type="date"
                                    name="deadlineDate"
                                    value={formData.deadlineDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Орієнт. сума</label>
                                <input
                                    type="number"
                                    name="estimatedAmount"
                                    value={formData.estimatedAmount}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Суд</label>
                            <input
                                type="text"
                                name="courtName"
                                value={formData.courtName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Адреса суду</label>
                                <input
                                    type="text"
                                    name="courtAddress"
                                    value={formData.courtAddress}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Суддя</label>
                                <input
                                    type="text"
                                    name="judgeName"
                                    value={formData.judgeName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Внутрішні нотатки</label>
                            <textarea
                                name="internalNotes"
                                value={formData.internalNotes}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Скасувати
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Збереження...' : 'Зберегти'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CasesPage;
