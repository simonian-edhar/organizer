import { IsEnum, IsString, IsOptional, IsUUID, ValidateNested, ArrayMinSize, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentType, DocumentStatus } from '../../database/entities/Document.entity';

/**
 * Upload Document DTO
 */
export class UploadDocumentDto {
    @IsOptional()
    @IsUUID()
    caseId?: string;

    @IsOptional()
    @IsUUID()
    clientId?: string;

    @IsEnum(['contract', 'agreement', 'court_order', 'evidence', 'invoice', 'other'])
    type: DocumentType;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(['public', 'internal', 'confidential'])
    accessLevel?: 'public' | 'internal' | 'confidential';

    @IsOptional()
    @IsUUID()
    parentDocumentId?: string;
}

/**
 * Update Document DTO
 */
export class UpdateDocumentDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(['draft', 'signed', 'rejected', 'archived'])
    status?: DocumentStatus;

    @IsOptional()
    @IsEnum(['public', 'internal', 'confidential'])
    accessLevel?: 'public' | 'internal' | 'confidential';
}

/**
 * Document Filters DTO
 */
export class DocumentFiltersDto {
    @IsOptional()
    @IsUUID()
    caseId?: string;

    @IsOptional()
    @IsUUID()
    clientId?: string;

    @IsOptional()
    @IsEnum(['contract', 'agreement', 'court_order', 'evidence', 'invoice', 'other'])
    type?: DocumentType;

    @IsOptional()
    @IsEnum(['draft', 'uploading', 'signed', 'rejected', 'archived'])
    status?: DocumentStatus;

    @IsOptional()
    @IsEnum(['public', 'internal', 'confidential'])
    accessLevel?: 'public' | 'internal' | 'confidential';

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @IsString()
    sortBy?: string;

    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC';
}

/**
 * Bulk Upload Documents DTO
 */
export class BulkUploadDocumentsDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => UploadDocumentDto)
    documents: UploadDocumentDto[];
}

/**
 * Sign Document DTO
 */
export class SignDocumentDto {
    @IsUUID()
    documentId: string;

    @IsString()
    signatureHash: string;

    @IsOptional()
    @IsString()
    signatureAlgorithm?: string;
}

/**
 * Generate Signed URL DTO
 */
export class GenerateSignedUrlDto {
    @IsUUID()
    documentId: string;

    @IsOptional()
    @Type(() => Number)
    @Max(7 * 24 * 60 * 60) // 7 days in seconds
    expiresIn?: number;
}
