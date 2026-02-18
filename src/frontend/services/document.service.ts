import api from './api';
import {
    Document,
    UploadDocumentDto,
    UpdateDocumentDto,
    DocumentFilters,
    DocumentListResponse,
    DocumentStatistics,
    SignDocumentDto,
    GenerateSignedUrlDto,
    SignedUrlResponse,
} from '../types/document.types';

/**
 * Document Service
 */
class DocumentService {
    private baseUrl = '/documents';

    /**
     * Get all documents
     */
    async getDocuments(filters?: DocumentFilters): Promise<DocumentListResponse> {
        const params = new URLSearchParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }

        const query = params.toString();
        return api.get<DocumentListResponse>(`${this.baseUrl}${query ? `?${query}` : ''}`);
    }

    /**
     * Get document by ID
     */
    async getDocument(id: string): Promise<Document> {
        return api.get<Document>(`${this.baseUrl}/${id}`);
    }

    /**
     * Upload document
     */
    async uploadDocument(
        file: File,
        data: UploadDocumentDto,
        onProgress?: (progress: number) => void
    ): Promise<Document> {
        const formData = new FormData();
        formData.append('file', file);
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        return api.upload<Document>(`${this.baseUrl}/upload`, file, onProgress);
    }

    /**
     * Update document
     */
    async updateDocument(id: string, data: UpdateDocumentDto): Promise<Document> {
        return api.put<Document>(`${this.baseUrl}/${id}`, data);
    }

    /**
     * Sign document
     */
    async signDocument(id: string, data: SignDocumentDto): Promise<Document> {
        return api.post<Document>(`${this.baseUrl}/${id}/sign`, data);
    }

    /**
     * Generate signed URL
     */
    async generateSignedUrl(id: string, data: GenerateSignedUrlDto): Promise<SignedUrlResponse> {
        return api.post<SignedUrlResponse>(`${this.baseUrl}/${id}/signed-url`, data);
    }

    /**
     * Delete document
     */
    async deleteDocument(id: string): Promise<void> {
        return api.delete(`${this.baseUrl}/${id}`);
    }

    /**
     * Get document statistics
     */
    async getStatistics(): Promise<DocumentStatistics> {
        return api.get<DocumentStatistics>(`${this.baseUrl}/statistics`);
    }

    /**
     * Download document
     */
    async downloadDocument(id: string, filename: string): Promise<void> {
        return api.download(`${this.baseUrl}/${id}/download`, filename);
    }
}

export const documentService = new DocumentService();
export default documentService;
