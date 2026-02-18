import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import documentService from '../../services/document.service';
import { Document, DocumentFilters, DocumentType, DocumentStatus, AccessLevel } from '../../types/document.types';
import { Spinner } from '../../components/Spinner';
import { Alert } from '../../components/Alert';
import './DocumentsPage.css';

/**
 * Documents Page
 */
export const DocumentsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<DocumentFilters>({
        limit: 20,
        page: 1,
        caseId: searchParams.get('caseId') || undefined,
    });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadDocuments();
    }, [filters]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await documentService.getDocuments(filters);
            setDocuments(response.data);
            setTotal(response.total);
            setPage(response.page);
        } catch (err: any) {
            setError(err.message || 'Помилка завантаження документів');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (search: string) => {
        setFilters({ ...filters, search, page: 1 });
    };

    const handleFilterChange = (key: keyof DocumentFilters, value: any) => {
        setFilters({ ...filters, [key]: value, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                await documentService.uploadDocument(
                    file,
                    {
                        caseId: filters.caseId || '',
                        type: 'other',
                        description: '',
                    },
                    (progress) => {
                        setUploadProgress(Math.round(((i + progress / 100) / files.length) * 100));
                    }
                );
            }
            loadDocuments();
        } catch (err: any) {
            setError(err.message || 'Помилка завантаження файлу');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей документ?')) {
            return;
        }

        try {
            await documentService.deleteDocument(id);
            loadDocuments();
        } catch (err: any) {
            setError(err.message || 'Помилка видалення документа');
        }
    };

    const handleDownload = async (doc: Document) => {
        try {
            const { url } = await documentService.generateSignedUrl(doc.id, { expiresIn: 3600 });
            window.open(url, '_blank');
        } catch (err: any) {
            setError(err.message || 'Помилка отримання посилання');
        }
    };

    const totalPages = Math.ceil(total / (filters.limit || 20));

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    const getFileIcon = (mimeType?: string) => {
        if (!mimeType) return 'file';
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
        return 'file';
    };

    const getStatusBadge = (status: DocumentStatus) => {
        const statusClasses: Record<DocumentStatus, string> = {
            draft: 'badge-secondary',
            uploading: 'badge-warning',
            signed: 'badge-success',
            rejected: 'badge-danger',
            archived: 'badge-default',
        };
        const statusLabels: Record<DocumentStatus, string> = {
            draft: 'Чернетка',
            uploading: 'Завантаження',
            signed: 'Підписано',
            rejected: 'Відхилено',
            archived: 'Архів',
        };
        return (
            <span className={`badge ${statusClasses[status]}`}>
                {statusLabels[status]}
            </span>
        );
    };

    const getTypeLabel = (type: DocumentType): string => {
        const labels: Record<DocumentType, string> = {
            contract: 'Договір',
            agreement: 'Угода',
            court_order: 'Судове рішення',
            evidence: 'Доказ',
            invoice: 'Рахунок',
            other: 'Інше',
        };
        return labels[type];
    };

    return (
        <div className="documents-page">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Документи</h1>
                    <p className="page-subtitle">Завантажуйте та керуйте документами</p>
                </div>
                <div className="header-actions">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <Spinner size="small" />
                                Завантаження... {uploadProgress}%
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                Завантажити
                            </>
                        )}
                    </button>
                </div>
            </div>

            {uploading && (
                <div className="upload-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span>Завантаження файлів... {uploadProgress}%</span>
                </div>
            )}

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            <div className="filters-bar">
                <div className="search-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Пошук документів..."
                        value={filters.search || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                >
                    <option value="">Усі типи</option>
                    <option value="contract">Договори</option>
                    <option value="agreement">Угоди</option>
                    <option value="court_order">Судові рішення</option>
                    <option value="evidence">Докази</option>
                    <option value="invoice">Рахунки</option>
                    <option value="other">Інше</option>
                </select>
                <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                    <option value="">Усі статуси</option>
                    <option value="draft">Чернетки</option>
                    <option value="signed">Підписані</option>
                    <option value="rejected">Відхилені</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-container">
                    <Spinner size="large" />
                </div>
            ) : documents.length === 0 ? (
                <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <h3>Документів не знайдено</h3>
                    <p>Завантажте перший документ</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Завантажити документ
                    </button>
                </div>
            ) : (
                <>
                    <div className="documents-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Документ</th>
                                    <th>Тип</th>
                                    <th>Розмір</th>
                                    <th>Статус</th>
                                    <th>Завантажено</th>
                                    <th>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.id}>
                                        <td>
                                            <div className="document-info">
                                                <div className={`file-icon file-icon-${getFileIcon(doc.mimeType)}`}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                    </svg>
                                                </div>
                                                <div className="document-details">
                                                    <span className="document-name">{doc.originalName}</span>
                                                    {doc.description && (
                                                        <span className="document-description">{doc.description}</span>
                                                    )}
                                                    {doc.caseId && (
                                                        <Link to={`/cases/${doc.caseId}`} className="document-case">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                                            </svg>
                                                            Переглянути справу
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="type-tag">{getTypeLabel(doc.type)}</span>
                                        </td>
                                        <td>{formatFileSize(doc.fileSize)}</td>
                                        <td>{getStatusBadge(doc.status)}</td>
                                        <td>
                                            <div className="upload-info">
                                                <span>{new Date(doc.uploadedAt).toLocaleDateString('uk-UA')}</span>
                                                {doc.uploadedByUser && (
                                                    <span className="uploader">
                                                        {doc.uploadedByUser.firstName} {doc.uploadedByUser.lastName}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleDownload(doc)}
                                                    title="Завантажити"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="7 10 12 15 17 10" />
                                                        <line x1="12" y1="15" x2="12" y2="3" />
                                                    </svg>
                                                </button>
                                                {doc.status === 'draft' && (
                                                    <button
                                                        className="btn-icon"
                                                        title="Підписати"
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M12 19l7-7 3 3-7 7-3-3z" />
                                                            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                                                            <path d="M2 2l7.586 7.586" />
                                                            <circle cx="11" cy="11" r="2" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-icon btn-danger"
                                                    onClick={() => handleDelete(doc.id)}
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
        </div>
    );
};

export default DocumentsPage;
