/**
 * Document Types
 */
export interface Document {
    id: string;
    tenantId: string;
    caseId?: string;
    clientId?: string;
    fileName: string;
    originalName: string;
    type: DocumentType;
    mimeType?: string;
    fileSize?: number;
    description?: string;
    status: DocumentStatus;
    storagePath?: string;
    cdnUrl?: string;
    signedUrl?: string;
    signatureHash?: string;
    signatureAlgorithm?: string;
    signedAt?: string;
    signedBy?: string;
    signedByUser?: any;
    uploadedBy: string;
    uploadedByUser?: any;
    uploadedAt: string;
    uploadIp?: string;
    version: number;
    parentDocumentId?: string;
    accessLevel: AccessLevel;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export type DocumentType =
    | 'contract'
    | 'agreement'
    | 'court_order'
    | 'evidence'
    | 'invoice'
    | 'other';

export type DocumentStatus =
    | 'draft'
    | 'uploading'
    | 'signed'
    | 'rejected'
    | 'archived';

export type AccessLevel = 'public' | 'internal' | 'confidential';

export interface UploadDocumentDto {
    caseId: string;
    type: DocumentType;
    description?: string;
    accessLevel?: AccessLevel;
    parentDocumentId?: string;
}

export interface UpdateDocumentDto {
    description?: string;
    status?: DocumentStatus;
    accessLevel?: AccessLevel;
}

export interface DocumentFilters {
    caseId?: string;
    clientId?: string;
    type?: DocumentType;
    status?: DocumentStatus;
    accessLevel?: AccessLevel;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface DocumentListResponse {
    data: Document[];
    total: number;
    page: number;
    limit: number;
}

export interface DocumentStatistics {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalSize: number;
}

export interface SignDocumentDto {
    documentId: string;
    signatureHash: string;
    signatureAlgorithm?: string;
}

export interface GenerateSignedUrlDto {
    documentId: string;
    expiresIn?: number;
}

export interface SignedUrlResponse {
    url: string;
    expiresAt: string;
}
