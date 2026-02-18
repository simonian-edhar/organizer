import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Calculation } from '../../database/entities/Calculation.entity';
import { CalculationItem } from '../../database/entities/CalculationItem.entity';
import { PricelistItem } from '../../database/entities/PricelistItem.entity';
import {
    CreateCalculationDto,
    UpdateCalculationDto,
    CalculationFiltersDto,
    GeneratePdfDto,
    ApproveCalculationDto,
    RejectCalculationDto,
} from '../dto/calculation.dto';

/**
 * Calculation Service
 */
@Injectable()
export class CalculationService {
    constructor(
        @InjectRepository(Calculation)
        private readonly calculationRepository: Repository<Calculation>,
        @InjectRepository(CalculationItem)
        private readonly calculationItemRepository: Repository<CalculationItem>,
        @InjectRepository(PricelistItem)
        private readonly pricelistItemRepository: Repository<PricelistItem>,
    ) {}

    /**
     * Get all calculations
     */
    async findAll(
        tenantId: string,
        filters: CalculationFiltersDto = {}
    ): Promise<{ data: Calculation[]; total: number; page: number; limit: number }> {
        const query = this.calculationRepository
            .createQueryBuilder('calculation')
            .where('calculation.tenantId = :tenantId AND calculation.deletedAt IS NULL', { tenantId });

        // Filter by case
        if (filters.caseId) {
            query.andWhere('calculation.caseId = :caseId', { caseId: filters.caseId });
        }

        // Filter by status
        if (filters.status) {
            query.andWhere('calculation.status = :status', { status: filters.status });
        }

        // Filter by date range
        if (filters.calculationDateFrom && filters.calculationDateTo) {
            query.andWhere('calculation.calculationDate BETWEEN :calculationDateFrom AND :calculationDateTo', {
                calculationDateFrom: new Date(filters.calculationDateFrom),
                calculationDateTo: new Date(filters.calculationDateTo),
            });
        } else if (filters.calculationDateFrom) {
            query.andWhere('calculation.calculationDate >= :calculationDateFrom', {
                calculationDateFrom: new Date(filters.calculationDateFrom),
            });
        } else if (filters.calculationDateTo) {
            query.andWhere('calculation.calculationDate <= :calculationDateTo', {
                calculationDateTo: new Date(filters.calculationDateTo),
            });
        }

        // Search
        if (filters.search) {
            query.andWhere(
                '(calculation.name ILIKE :search OR ' +
                'calculation.description ILIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        // Sorting
        const sortBy = filters.sortBy || 'calculationDate';
        const sortOrder = filters.sortOrder || 'DESC';
        query.orderBy(`calculation.${sortBy}`, sortOrder);

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        query.skip(skip).take(limit);

        // Include relations
        query.leftJoinAndSelect('calculation.case', 'case');
        query.leftJoinAndSelect('calculation.items', 'items');

        const [data, total] = await query.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
        };
    }

    /**
     * Get calculation by ID
     */
    async findById(tenantId: string, id: string): Promise<Calculation> {
        const calculation = await this.calculationRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: IsNull(),
            },
            relations: ['items', 'case', 'approvedBy'],
        });

        if (!calculation) {
            throw new NotFoundException('Розрахунок не знайдено');
        }

        return calculation;
    }

    /**
     * Create calculation
     */
    async create(
        tenantId: string,
        userId: string,
        dto: CreateCalculationDto
    ): Promise<Calculation> {
        // Generate calculation number
        const calculationNumber = await this.generateCalculationNumber(tenantId);

        // Calculate totals
        let subtotal = 0;
        let vatAmount = 0;
        const items = [];

        for (const itemDto of dto.items) {
            let unitPrice = itemDto.unitPrice;
            let lineTotal = 0;

            // Get price from pricelist if item not provided
            if (itemDto.pricelistItemId && !itemDto.unitPrice) {
                const pricelistItem = await this.pricelistItemRepository.findOne({
                    where: {
                        id: itemDto.pricelistItemId,
                        tenantId,
                        deletedAt: IsNull(),
                    },
                });

                if (pricelistItem) {
                    unitPrice = pricelistItem.basePrice;

                    if (itemDto.unitType === 'hourly') {
                        const duration = itemDto.duration || pricelistItem.defaultDuration || 60;
                        lineTotal = (unitPrice * duration) / 60;
                    } else if (itemDto.unitType === 'piecewise') {
                        const quantity = itemDto.quantity || 1;
                        lineTotal = unitPrice * quantity;
                    } else {
                        lineTotal = unitPrice;
                    }
                }
            }

            lineTotal = parseFloat(lineTotal.toFixed(2));
            subtotal += lineTotal;

            items.push({
                description: itemDto.description,
                pricelistItemId: itemDto.pricelistItemId,
                code: itemDto.code,
                unitType: itemDto.unitType,
                quantity: itemDto.quantity,
                duration: itemDto.duration,
                unitPrice,
                lineTotal,
                vatRate: 0, // TODO: from pricelist
                vatAmount: 0,
            });
        }

        // Calculate discount
        const discountAmount = 0; // TODO: from calculation settings

        // Calculate VAT
        const vatRate = 20; // TODO: from calculation settings
        vatAmount = subtotal * (vatRate / 100);

        const totalAmount = subtotal + vatAmount - discountAmount;

        const calculation = this.calculationRepository.create({
            tenantId,
            caseId: dto.caseId,
            number: calculationNumber,
            name: dto.name,
            calculationDate: new Date(dto.calculationDate),
            dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(dto.calculationDate),
            description: dto.description,
            subtotal: parseFloat(subtotal.toFixed(2)),
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            vatAmount: parseFloat(vatAmount.toFixed(2)),
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            currency: 'UAH',
            status: 'draft',
            pricelistId: dto.pricelistId,
            createdBy: userId,
            updatedBy: userId,
        });

        const savedCalculation = await this.calculationRepository.save(calculation);

        // Save items
        for (const item of items) {
            await this.calculationItemRepository.save({
                ...item,
                calculationId: savedCalculation.id,
                tenantId,
                createdBy: userId,
                updatedBy: userId,
            });
        }

        return savedCalculation;
    }

    /**
     * Update calculation
     */
    async update(
        tenantId: string,
        id: string,
        userId: string,
        dto: UpdateCalculationDto
    ): Promise<Calculation> {
        const calculation = await this.findById(tenantId, id);

        Object.assign(calculation, dto, {
            updatedBy: userId,
        });

        return this.calculationRepository.save(calculation);
    }

    /**
     * Delete calculation (soft delete)
     */
    async delete(tenantId: string, id: string, userId: string): Promise<void> {
        const calculation = await this.findById(tenantId, id);

        await this.calculationRepository.update(
            { id, tenantId },
            {
                deletedAt: new Date(),
                updatedBy: userId,
            }
        );
    }

    /**
     * Send for approval
     */
    async sendForApproval(tenantId: string, id: string, userId: string): Promise<Calculation> {
        const calculation = await this.findById(tenantId, id);

        if (calculation.status !== 'draft') {
            throw new BadRequestException('Тільки чернети можна відправити на затвердження');
        }

        calculation.status = 'pending_approval';
        calculation.updatedBy = userId;

        // TODO: Send notification to owner
        await this.calculationRepository.save(calculation);

        return calculation;
    }

    /**
     * Approve calculation
     */
    async approve(
        tenantId: string,
        id: string,
        userId: string,
        dto: ApproveCalculationDto
    ): Promise<Calculation> {
        const calculation = await this.findById(tenantId, id);

        if (calculation.status !== 'pending_approval') {
            throw new BadRequestException('Розрахунок не очікує затвердження');
        }

        calculation.status = 'approved';
        calculation.approvedById = userId;
        calculation.updatedBy = userId;

        return this.calculationRepository.save(calculation);
    }

    /**
     * Reject calculation
     */
    async reject(
        tenantId: string,
        id: string,
        userId: string,
        dto: RejectCalculationDto
    ): Promise<Calculation> {
        const calculation = await this.findById(tenantId, id);

        if (calculation.status !== 'pending_approval') {
            throw new BadRequestException('Розрахунок не очікує затвердження');
        }

        calculation.status = 'rejected';
        calculation.updatedBy = userId;

        // Add rejection reason to notes
        calculation.internalNotes = `[REJECTED] ${dto.reason}`;

        return this.calculationRepository.save(calculation);
    }

    /**
     * Generate PDF
     */
    async generatePdf(
        tenantId: string,
        id: string,
        dto: GeneratePdfDto
    ): Promise<{ pdfUrl: string; pdfGeneratedAt: Date }> {
        const calculation = await this.findById(tenantId, id);

        // TODO: Generate PDF using template service
        const pdfUrl = `https://cdn.laworganizer.ua/calculations/${id}.pdf`;
        const pdfGeneratedAt = new Date();

        calculation.pdfUrl = pdfUrl;
        calculation.pdfGeneratedAt = pdfGeneratedAt;
        calculation.updatedBy = dto.userId ?? 'system';

        await this.calculationRepository.save(calculation);

        return { pdfUrl, pdfGeneratedAt };
    }

    /**
     * Export calculation
     */
    async exportToExcel(tenantId: string, id: string): Promise<Buffer> {
        const calculation = await this.findById(tenantId, id);

        // TODO: Generate Excel export
        const excelData = Buffer.from('Excel data');

        return excelData;
    }

    /**
     * Get calculation statistics
     */
    async getStatistics(tenantId: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        totalAmount: number;
        paidAmount: number;
        outstandingAmount: number;
    }> {
        const [total] = await this.calculationRepository
            .createQueryBuilder('calculation')
            .select('COUNT(*)')
            .where('calculation.tenantId = :tenantId AND calculation.deletedAt IS NULL', { tenantId })
            .getRawMany();

        const [byStatus] = await this.calculationRepository
            .createQueryBuilder('calculation')
            .select('calculation.status', 'COUNT(*) as count')
            .where('calculation.tenantId = :tenantId AND calculation.deletedAt IS NULL', { tenantId })
            .groupBy('calculation.status')
            .getRawMany();

        const [totalAmount] = await this.calculationRepository
            .createQueryBuilder('calculation')
            .select('SUM(calculation.totalAmount)')
            .where('calculation.tenantId = :tenantId AND calculation.deletedAt IS NULL', { tenantId })
            .getRawMany();

        const [paidAmount] = await this.calculationRepository
            .createQueryBuilder('calculation')
            .select('SUM(calculation.paidAmount)')
            .where('calculation.tenantId = :tenantId AND calculation.deletedAt IS NULL', { tenantId })
            .getRawMany();

        const outstandingAmount = (totalAmount[0].sum || 0) - (paidAmount[0].sum || 0);

        return {
            total: parseInt(total[0].count),
            totalAmount: totalAmount[0].sum || 0,
            paidAmount: paidAmount[0].sum || 0,
            outstandingAmount,
            byStatus: byStatus.reduce((acc: Record<string, number>, row: { status: string; count: string }) => {
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {} as Record<string, number>),
        };
    }

    /**
     * Generate calculation number
     */
    private async generateCalculationNumber(tenantId: string): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // Get latest calculation number for this month/year
        const latest = await this.calculationRepository
            .createQueryBuilder('calculation')
            .select('calculation.number')
            .where('calculation.tenantId = :tenantId AND calculation.number LIKE :pattern', {
                tenantId,
                pattern: `CALC-${year}-${month}-%`,
            })
            .orderBy('calculation.number', 'DESC')
            .limit(1)
            .getOne();

        let number = 1;
        if (latest) {
            const parts = latest.number.split('-');
            number = parseInt(parts[3]) + 1;
        }

        return `CALC-${year}-${month}-${String(number).padStart(4, '0')}`;
    }
}
