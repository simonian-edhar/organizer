import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Case } from '../../database/entities/Case.entity';
import { CreateCaseDto, UpdateCaseDto, CaseFiltersDto } from '../dto/case.dto';
import { detectSqlInjection } from '../../common/utils/validation.util';

/**
 * Case Service
 */
@Injectable()
export class CaseService {
    constructor(
        @InjectRepository(Case)
        private readonly caseRepository: Repository<Case>,
    ) {}

    /**
     * Get all cases with filters
     */
    async findAll(
        tenantId: string,
        filters: CaseFiltersDto = {}
    ): Promise<{ data: Case[]; total: number; page: number; limit: number }> {
        const query = this.caseRepository
            .createQueryBuilder('case')
            .where('case.tenantId = :tenantId AND case.deletedAt IS NULL', { tenantId });

        // Filter by client
        if (filters.clientId) {
            query.andWhere('case.clientId = :clientId', { clientId: filters.clientId });
        }

        // Filter by assigned lawyer
        if (filters.assignedLawyerId) {
            query.andWhere('case.assignedLawyerId = :assignedLawyerId', {
                assignedLawyerId: filters.assignedLawyerId,
            });
        }

        // Filter by case type
        if (filters.caseType) {
            query.andWhere('case.caseType = :caseType', { caseType: filters.caseType });
        }

        // Filter by priority
        if (filters.priority) {
            query.andWhere('case.priority = :priority', { priority: filters.priority });
        }

        // Filter by status
        if (filters.status) {
            query.andWhere('case.status = :status', { status: filters.status });
        }

        // Filter by start date range
        if (filters.startDateFrom && filters.startDateTo) {
            query.andWhere('case.startDate BETWEEN :startDateFrom AND :startDateTo', {
                startDateFrom: new Date(filters.startDateFrom),
                startDateTo: new Date(filters.startDateTo),
            });
        } else if (filters.startDateFrom) {
            query.andWhere('case.startDate >= :startDateFrom', {
                startDateFrom: new Date(filters.startDateFrom),
            });
        } else if (filters.startDateTo) {
            query.andWhere('case.startDate <= :startDateTo', {
                startDateTo: new Date(filters.startDateTo),
            });
        }

        // Filter by deadline range
        if (filters.deadlineFrom && filters.deadlineTo) {
            query.andWhere('case.deadlineDate BETWEEN :deadlineFrom AND :deadlineTo', {
                deadlineFrom: new Date(filters.deadlineFrom),
                deadlineTo: new Date(filters.deadlineTo),
            });
        } else if (filters.deadlineFrom) {
            query.andWhere('case.deadlineDate >= :deadlineFrom', {
                deadlineFrom: new Date(filters.deadlineFrom),
            });
        } else if (filters.deadlineTo) {
            query.andWhere('case.deadlineDate <= :deadlineTo', {
                deadlineTo: new Date(filters.deadlineTo),
            });
        }

        // Search
        if (filters.search) {
            if (detectSqlInjection(filters.search)) {
                throw new ForbiddenException('Invalid search query');
            }

            query.andWhere(
                '(case.caseNumber ILIKE :search OR ' +
                'case.title ILIKE :search OR ' +
                'case.description ILIKE :search OR ' +
                'case.courtName ILIKE :search OR ' +
                'case.judgeName ILIKE :search)',
                { search: `%${filters.search}%` }
            );
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
            limit,
        };
    }

    /**
     * Get case by ID
     */
    async findById(tenantId: string, id: string): Promise<Case> {
        const caseEntity = await this.caseRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: IsNull(),
            },
            relations: ['client', 'assignedLawyer', 'documents', 'events'],
        });

        if (!caseEntity) {
            throw new NotFoundException('Справу не знайдено');
        }

        return caseEntity;
    }

    /**
     * Get case timeline (events and documents history)
     */
    async getTimeline(tenantId: string, id: string): Promise<any> {
        const caseEntity = await this.findById(tenantId, id);

        // Combine events and documents into timeline
        const events = caseEntity.events || [];
        const documents = caseEntity.documents || [];

        const timeline = [
            ...events.map(e => ({
                type: 'event',
                date: e.eventDate,
                data: e,
            })),
            ...documents.map(d => ({
                type: 'document',
                date: d.uploadedAt,
                data: d,
            })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return timeline;
    }

    /**
     * Create new case
     */
    async create(tenantId: string, userId: string, dto: CreateCaseDto): Promise<Case> {
        const caseEntity = this.caseRepository.create({
            tenantId,
            caseNumber: dto.caseNumber,
            caseType: dto.caseType,
            clientId: dto.clientId,
            assignedLawyerId: dto.assignedLawyerId,
            title: dto.title,
            description: dto.description,
            priority: dto.priority,
            courtName: dto.courtName,
            courtAddress: dto.courtAddress,
            judgeName: dto.judgeName,
            internalNotes: dto.internalNotes,
            clientNotes: dto.clientNotes,
            status: 'draft',
            startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            deadlineDate: dto.deadlineDate ? new Date(dto.deadlineDate) : undefined,
            estimatedAmount: dto.estimatedAmount || 0,
            paidAmount: 0,
            metadata: dto.metadata || {},
            createdBy: userId,
            updatedBy: userId,
        });

        return this.caseRepository.save(caseEntity);
    }

    /**
     * Update case
     */
    async update(
        tenantId: string,
        id: string,
        userId: string,
        dto: UpdateCaseDto
    ): Promise<Case> {
        const caseEntity = await this.findById(tenantId, id);

        // Update scalar fields
        if (dto.caseNumber) caseEntity.caseNumber = dto.caseNumber;
        if (dto.caseType) caseEntity.caseType = dto.caseType;
        if (dto.assignedLawyerId) caseEntity.assignedLawyerId = dto.assignedLawyerId;
        if (dto.title) caseEntity.title = dto.title;
        if (dto.description) caseEntity.description = dto.description;
        if (dto.priority) caseEntity.priority = dto.priority;
        if (dto.courtName) caseEntity.courtName = dto.courtName;
        if (dto.courtAddress) caseEntity.courtAddress = dto.courtAddress;
        if (dto.judgeName) caseEntity.judgeName = dto.judgeName;
        if (dto.internalNotes) caseEntity.internalNotes = dto.internalNotes;
        if (dto.clientNotes) caseEntity.clientNotes = dto.clientNotes;
        if (dto.metadata) caseEntity.metadata = dto.metadata;

        // Handle date fields
        if (dto.startDate) {
            caseEntity.startDate = new Date(dto.startDate);
        }
        if (dto.endDate) {
            caseEntity.endDate = new Date(dto.endDate);
        }
        if (dto.nextHearingDate) {
            caseEntity.nextHearingDate = new Date(dto.nextHearingDate);
        }
        if (dto.deadlineDate) {
            caseEntity.deadlineDate = new Date(dto.deadlineDate);
        }

        caseEntity.updatedBy = userId;

        return this.caseRepository.save(caseEntity);
    }

    /**
     * Delete case (soft delete)
     */
    async delete(tenantId: string, id: string, userId: string): Promise<void> {
        const caseEntity = await this.findById(tenantId, id);

        await this.caseRepository.update(
            { id, tenantId },
            {
                deletedAt: new Date(),
                updatedBy: userId,
            }
        );
    }

    /**
     * Restore deleted case
     */
    async restore(tenantId: string, id: string, userId: string): Promise<Case> {
        await this.caseRepository.update(
            { id, tenantId },
            {
                deletedAt: undefined,
                updatedBy: userId,
            }
        );

        return this.findById(tenantId, id);
    }

    /**
     * Change case status
     */
    async changeStatus(
        tenantId: string,
        id: string,
        userId: string,
        status: 'draft' | 'active' | 'on_hold' | 'closed' | 'archived'
    ): Promise<Case> {
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
     */
    async getUpcomingDeadlines(tenantId: string, days: number = 30): Promise<Case[]> {
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        return this.caseRepository.find({
            where: {
                tenantId,
                deadlineDate: Between(now, futureDate),
                status: 'active',
                deletedAt: IsNull(),
            },
            order: {
                deadlineDate: 'ASC',
            },
            relations: ['client', 'assignedLawyer'],
        });
    }

    /**
     * Get cases statistics
     */
    async getStatistics(tenantId: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
        activeCases: number;
        upcomingDeadlines: number;
    }> {
        const totalQuery = this.caseRepository
            .createQueryBuilder('case')
            .select('COUNT(*)', 'count')
            .where('case.tenantId = :tenantId AND case.deletedAt IS NULL', { tenantId });

        const byStatusQuery = this.caseRepository
            .createQueryBuilder('case')
            .select('case.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('case.tenantId = :tenantId AND case.deletedAt IS NULL', { tenantId })
            .groupBy('case.status');

        const byTypeQuery = this.caseRepository
            .createQueryBuilder('case')
            .select('case.caseType', 'caseType')
            .addSelect('COUNT(*)', 'count')
            .where('case.tenantId = :tenantId AND case.deletedAt IS NULL', { tenantId })
            .groupBy('case.caseType');

        const byPriorityQuery = this.caseRepository
            .createQueryBuilder('case')
            .select('case.priority', 'priority')
            .addSelect('COUNT(*)', 'count')
            .where('case.tenantId = :tenantId AND case.deletedAt IS NULL', { tenantId })
            .groupBy('case.priority');

        const activeCasesQuery = this.caseRepository
            .createQueryBuilder('case')
            .select('COUNT(*)', 'count')
            .where('case.tenantId = :tenantId AND case.status = :status AND case.deletedAt IS NULL', {
                tenantId,
                status: 'active',
            });

        const now = new Date();
        const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const upcomingDeadlinesQuery = this.caseRepository
            .createQueryBuilder('case')
            .select('COUNT(*)', 'count')
            .where(
                'case.tenantId = :tenantId AND case.deadlineDate BETWEEN :now AND :futureDate AND case.deletedAt IS NULL',
                { tenantId, now, futureDate }
            );

        const [totalResult, byStatusResult, byTypeResult, byPriorityResult, activeCasesResult, upcomingDeadlinesResult] =
            await Promise.all([
                totalQuery.getRawOne(),
                byStatusQuery.getRawMany(),
                byTypeQuery.getRawMany(),
                byPriorityQuery.getRawMany(),
                activeCasesQuery.getRawOne(),
                upcomingDeadlinesQuery.getRawOne(),
            ]);

        return {
            total: parseInt(totalResult?.count || '0'),
            byStatus: byStatusResult.reduce((acc, row) => {
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {} as Record<string, number>),
            byType: byTypeResult.reduce((acc, row) => {
                acc[row.caseType] = parseInt(row.count);
                return acc;
            }, {} as Record<string, number>),
            byPriority: byPriorityResult.reduce((acc, row) => {
                acc[row.priority] = parseInt(row.count);
                return acc;
            }, {} as Record<string, number>),
            activeCases: parseInt(activeCasesResult?.count || '0'),
            upcomingDeadlines: parseInt(upcomingDeadlinesResult?.count || '0'),
        };
    }
}
