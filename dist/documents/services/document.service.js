"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DocumentService", {
    enumerable: true,
    get: function() {
        return DocumentService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _Documententity = require("../../database/entities/Document.entity");
const _validationutil = require("../../common/utils/validation.util");
const _filestorageservice = require("../../file-storage/services/file-storage.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let DocumentService = class DocumentService {
    /**
     * Get all documents with filters
     */ async findAll(tenantId, filters = {}) {
        const query = this.documentRepository.createQueryBuilder('document').where('document.tenantId = :tenantId AND document.deletedAt IS NULL', {
            tenantId
        });
        // Filter by case
        if (filters.caseId) {
            query.andWhere('document.caseId = :caseId', {
                caseId: filters.caseId
            });
        }
        // Filter by client
        if (filters.clientId) {
            query.andWhere('document.clientId = :clientId', {
                clientId: filters.clientId
            });
        }
        // Filter by type
        if (filters.type) {
            query.andWhere('document.type = :type', {
                type: filters.type
            });
        }
        // Filter by status
        if (filters.status) {
            query.andWhere('document.status = :status', {
                status: filters.status
            });
        }
        // Filter by access level
        if (filters.accessLevel) {
            query.andWhere('document.accessLevel = :accessLevel', {
                accessLevel: filters.accessLevel
            });
        }
        // Search
        if (filters.search) {
            query.andWhere('(document.fileName ILIKE :search OR ' + 'document.description ILIKE :search OR ' + 'document.originalName ILIKE :search)', {
                search: `%${filters.search}%`
            });
        }
        // Sorting
        const sortBy = filters.sortBy || 'uploadedAt';
        const sortOrder = filters.sortOrder || 'DESC';
        query.orderBy(`document.${sortBy}`, sortOrder);
        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);
        // Include relations
        query.leftJoinAndSelect('document.uploadedByUser', 'uploadedByUser');
        query.leftJoinAndSelect('document.case', 'case');
        const [data, total] = await query.getManyAndCount();
        return {
            data,
            total,
            page,
            limit
        };
    }
    /**
     * Get document by ID
     */ async findById(tenantId, id) {
        const document = await this.documentRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: null
            },
            relations: [
                'uploadedByUser',
                'case',
                'signedByUser'
            ]
        });
        if (!document) {
            throw new _common.NotFoundException('Документ не знайдено');
        }
        return document;
    }
    /**
     * Upload document
     */ async upload(tenantId, userId, file, dto) {
        // Validate file
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/jpg'
        ];
        const maxSize = 50 * 1024 * 1024; // 50 MB
        const validation = (0, _validationutil.validateFileUpload)(file, allowedMimeTypes, maxSize);
        if (!validation.valid) {
            throw new _common.BadRequestException(validation.error);
        }
        // Upload file using file storage service
        const uploadResult = await this.fileStorageService.uploadFile(tenantId, userId, file, {
            caseId: dto.caseId,
            clientId: dto.clientId,
            folder: 'documents',
            isPublic: false,
            metadata: {
                documentType: dto.type,
                description: dto.description || ''
            }
        });
        const document = this.documentRepository.create({
            tenantId,
            caseId: dto.caseId,
            clientId: dto.clientId,
            fileName: uploadResult.path.split('/').pop() || uploadResult.path,
            originalName: file.originalname,
            type: dto.type,
            description: dto.description,
            mimeType: file.mimetype,
            fileSize: file.size,
            status: 'draft',
            storagePath: uploadResult.path,
            cdnUrl: uploadResult.url,
            accessLevel: dto.accessLevel || 'internal',
            uploadedBy: userId,
            uploadedAt: new Date(),
            createdBy: userId,
            updatedBy: userId
        });
        const savedDocument = await this.documentRepository.save(document);
        return savedDocument;
    }
    /**
     * Update document metadata
     */ async update(tenantId, id, userId, dto) {
        const document = await this.findById(tenantId, id);
        Object.assign(document, dto, {
            updatedBy: userId
        });
        return this.documentRepository.save(document);
    }
    /**
     * Sign document
     */ async sign(tenantId, id, userId, dto) {
        const document = await this.findById(tenantId, id);
        // TODO: Verify signature hash
        // This would integrate with the e-signature service
        document.status = 'signed';
        document.signatureHash = dto.signatureHash;
        document.signatureAlgorithm = dto.signatureAlgorithm || 'ECDSA';
        document.signedAt = new Date();
        document.signedBy = userId;
        document.updatedBy = userId;
        document.version += 1;
        return this.documentRepository.save(document);
    }
    /**
     * Generate signed URL (time-limited)
     */ async generateSignedUrl(tenantId, id, dto) {
        const document = await this.findById(tenantId, id);
        const expiresAt = new Date(Date.now() + (dto.expiresIn || 7 * 24 * 60 * 60 * 1000));
        const expiresIn = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
        // Generate signed URL using storage service
        const signedUrl = await this.fileStorageService.generateSignedUrl(tenantId, document.storagePath, {
            expiresIn,
            disposition: 'attachment'
        });
        // Store signed URL info in metadata
        document.signedUrl = signedUrl;
        document.metadata = {
            ...document.metadata,
            signedUrlExpiresAt: expiresAt.toISOString()
        };
        await this.documentRepository.save(document);
        return {
            url: signedUrl,
            expiresAt
        };
    }
    /**
     * Delete document (soft delete)
     */ async delete(tenantId, id, userId) {
        const document = await this.findById(tenantId, id);
        // Delete file from storage
        if (document.storagePath) {
            await this.fileStorageService.deleteFile(tenantId, document.storagePath);
        }
        await this.documentRepository.update({
            id,
            tenantId
        }, {
            deletedAt: new Date(),
            updatedBy: userId
        });
    }
    /**
     * Bulk upload documents
     */ async bulkUpload(tenantId, userId, files, dtos) {
        const results = {
            success: 0,
            failed: 0,
            documents: []
        };
        for(let i = 0; i < files.length && i < dtos.length; i++){
            try {
                const document = await this.upload(tenantId, userId, files[i], dtos[i]);
                results.success++;
                results.documents.push(document);
            } catch (error) {
                results.failed++;
            }
        }
        return results;
    }
    /**
     * Get document statistics
     */ async getStatistics(tenantId) {
        const [total] = await this.documentRepository.createQueryBuilder('document').select('COUNT(*)').where('document.tenantId = :tenantId AND document.deletedAt IS NULL', {
            tenantId
        }).getRawMany();
        const [totalSize] = await this.documentRepository.createQueryBuilder('document').select('SUM(document.fileSize)').where('document.tenantId = :tenantId AND document.deletedAt IS NULL', {
            tenantId
        }).getRawMany();
        const byType = await this.documentRepository.createQueryBuilder('document').select('document.type', 'COUNT(*) as count').where('document.tenantId = :tenantId AND document.deletedAt IS NULL', {
            tenantId
        }).groupBy('document.type').getRawMany();
        const byStatus = await this.documentRepository.createQueryBuilder('document').select('document.status', 'COUNT(*) as count').where('document.tenantId = :tenantId AND document.deletedAt IS NULL', {
            tenantId
        }).groupBy('document.status').getRawMany();
        return {
            total: parseInt(total[0].count),
            totalSize: parseInt(totalSize[0].sum) || 0,
            byType: byType.reduce((acc, row)=>{
                acc[row.type] = parseInt(row.count);
                return acc;
            }, {}),
            byStatus: byStatus.reduce((acc, row)=>{
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {})
        };
    }
    constructor(documentRepository, fileStorageService){
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
    }
};
DocumentService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_Documententity.Document)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _filestorageservice.FileStorageService === "undefined" ? Object : _filestorageservice.FileStorageService
    ])
], DocumentService);

//# sourceMappingURL=document.service.js.map