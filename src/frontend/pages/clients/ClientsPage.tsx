import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clientService from '../../services/client.service';
import { Client, ClientFilters, ClientType, ClientStatus } from '../../types/client.types';
import { Spinner } from '../../components/Spinner';
import { Alert } from '../../components/Alert';
import './ClientsPage.css';

/**
 * Clients List Page
 */
export const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<ClientFilters>({
        limit: 20,
        page: 1,
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    useEffect(() => {
        loadClients();
    }, [filters]);

    const loadClients = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await clientService.getClients(filters);
            setClients(response.data);
            setTotal(response.total);
            setPage(response.page);
        } catch (err: any) {
            setError(err.message || 'Помилка завантаження клієнтів');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (search: string) => {
        setFilters({ ...filters, search, page: 1 });
    };

    const handleFilterChange = (key: keyof ClientFilters, value: any) => {
        setFilters({ ...filters, [key]: value, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цього клієнта?')) {
            return;
        }

        try {
            await clientService.deleteClient(id);
            loadClients();
        } catch (err: any) {
            setError(err.message || 'Помилка видалення клієнта');
        }
    };

    const openCreateModal = () => {
        setSelectedClient(null);
        setShowModal(true);
    };

    const openEditModal = (client: Client) => {
        setSelectedClient(client);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedClient(null);
    };

    const handleSave = async () => {
        closeModal();
        loadClients();
    };

    const totalPages = Math.ceil(total / (filters.limit || 20));

    const getClientDisplayName = (client: Client): string => {
        if (client.type === 'individual') {
            return `${client.lastName || ''} ${client.firstName || ''} ${client.patronymic || ''}`.trim();
        }
        return client.companyName || 'Невідома компанія';
    };

    const getStatusBadge = (status: ClientStatus) => {
        const statusClasses: Record<ClientStatus, string> = {
            active: 'badge-success',
            inactive: 'badge-warning',
            blocked: 'badge-danger',
        };
        const statusLabels: Record<ClientStatus, string> = {
            active: 'Активний',
            inactive: 'Неактивний',
            blocked: 'Заблокований',
        };
        return (
            <span className={`badge ${statusClasses[status]}`}>
                {statusLabels[status]}
            </span>
        );
    };

    return (
        <div className="clients-page">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Клієнти</h1>
                    <p className="page-subtitle">Керуйте вашими клієнтами та їхніми даними</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Додати клієнта
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
                        placeholder="Пошук клієнтів..."
                        value={filters.search || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                >
                    <option value="">Усі типи</option>
                    <option value="individual">Фізичні особи</option>
                    <option value="legal_entity">Юридичні особи</option>
                </select>
                <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                    <option value="">Усі статуси</option>
                    <option value="active">Активні</option>
                    <option value="inactive">Неактивні</option>
                    <option value="blocked">Заблоковані</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-container">
                    <Spinner size="large" />
                </div>
            ) : clients.length === 0 ? (
                <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <h3>Клієнтів не знайдено</h3>
                    <p>Додайте першого клієнта, щоб почати роботу</p>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        Додати клієнта
                    </button>
                </div>
            ) : (
                <>
                    <div className="clients-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Клієнт</th>
                                    <th>Тип</th>
                                    <th>Контакти</th>
                                    <th>Статус</th>
                                    <th>Створено</th>
                                    <th>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id}>
                                        <td>
                                            <Link to={`/clients/${client.id}`} className="client-name">
                                                {getClientDisplayName(client)}
                                            </Link>
                                            {client.type === 'legal_entity' && client.edrpou && (
                                                <span className="client-edrpou">ЄДРПОУ: {client.edrpou}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`type-badge type-${client.type}`}>
                                                {client.type === 'individual' ? 'ФО' : 'ЮО'}
                                            </span>
                                        </td>
                                        <td>
                                            {client.email && <div className="contact-item">{client.email}</div>}
                                            {client.phone && <div className="contact-item">{client.phone}</div>}
                                        </td>
                                        <td>{getStatusBadge(client.status)}</td>
                                        <td>{new Date(client.createdAt).toLocaleDateString('uk-UA')}</td>
                                        <td>
                                            <div className="actions">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => openEditModal(client)}
                                                    title="Редагувати"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <Link
                                                    to={`/cases?clientId=${client.id}`}
                                                    className="btn-icon"
                                                    title="Справи"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    className="btn-icon btn-danger"
                                                    onClick={() => handleDelete(client.id)}
                                                    title="Видалити"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

            {showModal && (
                <ClientFormModal
                    client={selectedClient}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

/**
 * Client Form Modal
 */
interface ClientFormModalProps {
    client: Client | null;
    onClose: () => void;
    onSave: () => void;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ client, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        type: client?.type || 'individual' as ClientType,
        firstName: client?.firstName || '',
        lastName: client?.lastName || '',
        patronymic: client?.patronymic || '',
        companyName: client?.companyName || '',
        edrpou: client?.edrpou || '',
        inn: client?.inn || '',
        email: client?.email || '',
        phone: client?.phone || '',
        secondaryPhone: client?.secondaryPhone || '',
        address: client?.address || '',
        city: client?.city || '',
        region: client?.region || '',
        postalCode: client?.postalCode || '',
        country: client?.country || 'Україна',
        notes: client?.notes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (client) {
                await clientService.updateClient(client.id, formData);
            } else {
                await clientService.createClient(formData);
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
            <div className="modal">
                <div className="modal-header">
                    <h2>{client ? 'Редагувати клієнта' : 'Новий клієнт'}</h2>
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
                        <div className="form-group">
                            <label>Тип клієнта</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                            >
                                <option value="individual">Фізична особа</option>
                                <option value="legal_entity">Юридична особа</option>
                            </select>
                        </div>

                        {formData.type === 'individual' ? (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Прізвище</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Ім'я</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>По батькові</label>
                                        <input
                                            type="text"
                                            name="patronymic"
                                            value={formData.patronymic}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Назва компанії</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>ЄДРПОУ</label>
                                        <input
                                            type="text"
                                            name="edrpou"
                                            value={formData.edrpou}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>ІПН</label>
                                        <input
                                            type="text"
                                            name="inn"
                                            value={formData.inn}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Телефон</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Адреса</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Місто</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Область</label>
                                <input
                                    type="text"
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Поштовий індекс</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Примітки</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
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

export default ClientsPage;
