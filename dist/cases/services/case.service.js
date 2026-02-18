"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CaseService", {
    enumerable: true,
    get: function() {
        return CaseService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _Caseentity = require("../../database/entities/Case.entity");
const _validationutil = require("../../common/utils/validation.util");
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
let CaseService = class CaseService {
    /**
     * Get all cases with filters
     */ async findAll(tenantId, filters = {}) {
        const query = this.caseRepository.createQueryBuilder('case').where('case.tenantId = :tenantId AND case.deletedAt IS NULL', {
            tenantId
        });
        // Filter by client
        if (filters.clientId) {
            query.andWhere('case.clientId = :clientId', {
                clientId: filters.clientId
            });
        }
        // Filter by assigned lawyer
        if (filters.assignedLawyerId) {
            query.andWhere('case.assignedLawyerId = :assignedLawyerId', {
                assignedLawyerId: filters.assignedLawyerId
            });
        }
        // Filter by case type
        if (filters.caseType) {
            query.andWhere('case.caseType = :caseType', {
                caseType: filters.caseType
            });
        }
        // Filter by priority
        if (filters.priority) {
            query.andWhere('case.priority = :priority', {
                priority: filters.priority
            });
        }
        // Filter by status
        if (filters.status) {
            query.andWhere('case.status = :status', {
                status: filters.status
            });
        }
        // Filter by start date range
        if (filters.startDateFrom && filters.startDateTo) {
            query.andWhere('case.startDate BETWEEN :startDateFrom AND :startDateTo', {
                startDateFrom: new Date(filters.startDateFrom),
                startDateTo: new Date(filters.startDateTo)
            });
        } else if (filters.startDateFrom) {
            query.andWhere('case.startDate >= :startDateFrom', {
                startDateFrom: new Date(filters.startDateFrom)
            });
        } else if (filters.startDateTo) {
            query.andWhere('case.startDate <= :startDateTo', {
                startDateTo: new Date(filters.startDateTo)
            });
        }
        // Filter by deadline range
        if (filters.deadlineFrom && filters.deadlineTo) {
            query.andWhere('case.deadlineDate BETWEEN :deadlineFrom AND :deadlineTo', {
                deadlineFrom: new Date(filters.deadlineFrom),
                deadlineTo: new Date(filters.deadlineTo)
            });
        } else if (filters.deadlineFrom) {
            query.andWhere('case.deadlineDate >= :deadlineFrom', {
                deadlineFrom: new Date(filters.deadlineFrom)
            });
        } else if (filters.deadlineTo) {
            query.andWhere('case.deadlineDate <= :deadlineTo', {
                deadlineTo: new Date(filters.deadlineTo)
            });
        }
        // Search
        if (filters.search) {
            if ((0, _validationutil.detectSqlInjection)(filters.search)) {
                throw new _common.ForbiddenException('Invalid search query');
            }
            query.andWhere('(case.caseNumber ILIKE :search OR ' + 'case.title ILIKE :search OR ' + 'case.description ILIKE :search OR ' + 'case.courtName ILIKE :search OR ' + 'case.judgeName ILIKE :search)', {
                search: `%${filters.search}%`
            });
        }
        // Sorting
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'DESC';
        query.orderBy(`case.${sortBy}`, sortOrder);
        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);
        // Include relations
        query.leftJoinAndSelect('case.client', 'client');
        query.leftJoinAndSelect('case.assignedLawyer', 'assignedLawyer');
        const [data, total] = await query.getManyAndCount();
        return {
            data,
            total,
            page,
            limit
        };
    }
    /**
     * Get case by ID
     */ async findById(tenantId, id) {
        const caseEntity = await this.caseRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: null
            },
            relations: [
                'client',
                'assignedLawyer',
                'documents',
                'events'
            ]
        });
        if (!caseEntity) {
            throw new _common.NotFoundException('Справу не знайдено');
        }
        return caseEntity;
    }
    /**
     * Get case timeline (events and documents history)
     */ async getTimeline(tenantId, id) {
        const caseEntity = await this.findById(tenantId, id);
        // Combine events and documents into timeline
        const events = caseEntity.events || [];
        const documents = caseEntity.documents || [];
        const timeline = [
            ...events.map((e)=>({
                    type: 'event',
                    date: e.eventDate,
                    data: e
                })),
            ...documents.map((d)=>({
                    type: 'document',
                    date: d.uploadedAt,
                    data: d
                }))
        ].sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime());
        return timeline;
    }
    /**
     * Create new case
     */ async create(tenantId, userId, dto) {
        const caseEntity = this.caseRepository.create({
            tenantId,
            ...dto,
            status: 'draft',
            startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            deadlineDate: dto.deadlineDate ? new Date(dto.deadlineDate) : null,
            estimatedAmount: dto.estimatedAmount || 0,
            paidAmount: 0,
            metadata: dto.metadata || {},
            createdBy: userId,
            updatedBy: userId
        });
        return this.caseRepository.save(caseEntity);
    }
    /**
     * Update case
     */ async update(tenantId, id, userId, dto) {
        const caseEntity = await this.findById(tenantId, id);
        const updateData = {
            ...dto,
            updatedBy: userId
        };
        // Handle date fields
        if (dto.startDate) {
            updateData.startDate = new Date(dto.startDate);
        }
        if (dto.endDate) {
            updateData.endDate = new Date(dto.endDate);
        }
        if (dto.nextHearingDate) {
            updateData.nextHearingDate = new Date(dto.nextHearingDate);
        }
        if (dto.deadlineDate) {
            updateData.deadlineDate = new Date(dto.deadlineDate);
        }
        Object.assign(caseEntity, updateData);
        return this.caseRepository.save(caseEntity);
    }
    /**
     * Delete case (soft delete)
     */ async delete(tenantId, id, userId) {
        const caseEntity = await this.findById(tenantId, id);
        await this.caseRepository.update({
            id,
            tenantId
        }, {
            deletedAt: new Date(),
            updatedBy: userId
        });
    }
    /**
     * Restore deleted case
     */ async restore(tenantId, id, userId) {
        await this.caseRepository.update({
            id,
            tenantId
        }, {
            deletedAt: null,
            updatedBy: userId
        });
        return this.findById(tenantId, id);
    }
    /**
     * Change case status
     */ async changeStatus(tenantId, id, userId, status) {
        const caseEntity = await this.findById(tenantId, id);
        caseEntity.status = status;
        caseEntity.updatedBy = userId;
        if (status === 'closed') {
            caseEntity.endDate = new Date();
        }
        return this.caseRepository.save(caseEntity);
    }
    /**
     * Get upcoming deadlines
     */ async getUpcomingDeadlines(tenantId, days = 30) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        return this.caseRepository.find({
            where: {
                tenantId,
                deadlineDate: (0, _typeorm1.Between)(now, futureDate),
                status: 'active',
                deletedAt: null
            },
            order: {
                deadlineDate: 'ASC'
            },
            relations: [
                'client',
                'assignedLawyer'
            ]
        });
    }
    /**
     * Get cases statistics
     */ async getStatistics(tenantId) {
        const totalQuery = this.caseRepository.createQueryBuilder('case').select('COUNT(*)', 'count').where('case.tenantId = :tenantId AND case.deletedAt IS NULL', {
            tenantId
        });
        const byStatusQuery = this.caseRepository.createQueryBuilder('case').select('case.status', 'status').addSelect('COUNT(*)', 'count').where('case.tenantId = :tenantId AND case.deletedAt IS NULL', {
            tenantId
        }).groupBy('case.status');
        const byTypeQuery = this.caseRepository.createQueryBuilder('case').select('case.caseType', 'caseType').addSelect('COUNT(*)', 'count').where('case.tenantId = :tenantId AND case.deletedAt IS NULL', {
            tenantId
        }).groupBy('case.caseType');
        const byPriorityQuery = this.caseRepository.createQueryBuilder('case').select('case.priority', 'priority').addSelect('COUNT(*)', 'count').where('case.tenantId = :tenantId AND case.deletedAt IS NULL', {
            tenantId
        }).groupBy('case.priority');
        const activeCasesQuery = this.caseRepository.createQueryBuilder('case').select('COUNT(*)', 'count').where('case.tenantId = :tenantId AND case.status = :status AND case.deletedAt IS NULL', {
            tenantId,
            status: 'active'
        });
        const now = new Date();
        const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const upcomingDeadlinesQuery = this.caseRepository.createQueryBuilder('case').select('COUNT(*)', 'count').where('case.tenantId = :tenantId AND case.deadlineDate BETWEEN :now AND :future AND case.deletedAt IS NULL', {
            tenantId,
            now,
            future
        });
        const [totalResult, byStatusResult, byTypeResult, byPriorityResult, activeCasesResult, upcomingDeadlinesResult] = await Promise.all([
            totalQuery.getRawOne(),
            byStatusQuery.getRawMany(),
            byTypeQuery.getRawMany(),
            byPriorityQuery.getRawMany(),
            activeCasesQuery.getRawOne(),
            upcomingDeadlinesQuery.getRawOne()
        ]);
        return {
            total: parseInt(totalResult?.count || '0'),
            byStatus: byStatusResult.reduce((acc, row)=>{
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {}),
            byType: byTypeResult.reduce((acc, row)=>{
                acc[row.caseType] = parseInt(row.count);
                return acc;
            }, {}),
            byPriority: byPriorityResult.reduce((acc, row)=>{
                acc[row.priority] = parseInt(row.count);
                return acc;
            }, {}),
            activeCases: parseInt(activeCasesResult?.count || '0'),
            upcomingDeadlines: parseInt(upcomingDeadlinesResult?.count || '0')
        };
    }
    constructor(caseRepository){
        this.caseRepository = caseRepository;
    }
};
CaseService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_Caseentity.Case)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], CaseService);

//# sourceMappingURL=case.service.js.map