"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CalculationService", {
    enumerable: true,
    get: function() {
        return CalculationService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _Calculationentity = require("../../database/entities/Calculation.entity");
const _CalculationItementity = require("../../database/entities/CalculationItem.entity");
const _PricelistItementity = require("../../database/entities/PricelistItem.entity");
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
let CalculationService = class CalculationService {
    /**
     * Get all calculations
     */ async findAll(tenantId, filters = {}) {
        const query = this.calculationRepository.createQueryBuilder('calculation').where('calculation.tenantId = :tenantId AND calculation.deletedAt IS NULL', {
            tenantId
        });
        // Filter by case
        if (filters.caseId) {
            query.andWhere('calculation.caseId = :caseId', {
                caseId: filters.caseId
            });
        }
        // Filter by status
        if (filters.status) {
            query.andWhere('calculation.status = :status', {
                status: filters.status
            });
        }
        // Filter by date range
        if (filters.calculationDateFrom && filters.calculationDateTo) {
            query.andWhere('calculation.calculationDate BETWEEN :calculationDateFrom AND :calculationDateTo', {
                calculationDateFrom: new Date(filters.calculationDateFrom),
                calculationDateTo: new Date(filters.calculationDateTo)
            });
        } else if (filters.calculationDateFrom) {
            query.andWhere('calculation.calculationDate >= :calculationDateFrom', {
                calculationDateFrom: new Date(filters.calculationDateFrom)
            });
        } else if (filters.calculationDateTo) {
            query.andWhere('calculation.calculationDate <= :calculationDateTo', {
                calculationDateTo: new Date(filters.calculationDateTo)
            });
        }
        // Search
        if (filters.search) {
            query.andWhere('(calculation.name ILIKE :search OR ' + 'calculation.description ILIKE :search)', {
                search: `%${filters.search}%`
            });
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
            limit
        };
    }
    /**
     * Get calculation by ID
     */ async findById(tenantId, id) {
        const calculation = await this.calculationRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: null
            },
            relations: [
                'items',
                'case',
                'approvedBy'
            ]
        });
        if (!calculation) {
            throw new _common.NotFoundException('Розрахунок не знайдено');
        }
        return calculation;
    }
    /**
     * Create calculation
     */ async create(tenantId, userId, dto) {
        // Generate calculation number
        const calculationNumber = await this.generateCalculationNumber(tenantId);
        // Calculate totals
        let subtotal = 0;
        let vatAmount = 0;
        const items = [];
        for (const itemDto of dto.items){
            let unitPrice = itemDto.unitPrice;
            let lineTotal = 0;
            // Get price from pricelist if item not provided
            if (itemDto.pricelistItemId && !itemDto.unitPrice) {
                const pricelistItem = await this.pricelistItemRepository.findOne({
                    where: {
                        id: itemDto.pricelistItemId,
                        tenantId,
                        deletedAt: null
                    }
                });
                if (pricelistItem) {
                    unitPrice = pricelistItem.basePrice;
                    if (itemDto.unitType === 'hourly') {
                        const duration = itemDto.duration || pricelistItem.defaultDuration || 60;
                        lineTotal = unitPrice * duration / 60;
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
                vatRate: 0,
                vatAmount: 0
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
            updatedBy: userId
        });
        const savedCalculation = await this.calculationRepository.save(calculation);
        // Save items
        for (const item of items){
            await this.calculationItemRepository.save({
                ...item,
                calculationId: savedCalculation.id,
                tenantId,
                createdBy: userId,
                updatedBy: userId
            });
        }
        return savedCalculation;
    }
    /**
     * Update calculation
     */ async update(tenantId, id, userId, dto) {
        const calculation = await this.findById(tenantId, id);
        Object.assign(calculation, dto, {
            updatedBy: userId
        });
        return this.calculationRepository.save(calculation);
    }
    /**
     * Delete calculation (soft delete)
     */ async delete(tenantId, id, userId) {
        const calculation = await this.findById(tenantId, id);
        await this.calculationRepository.update({
            id,
            tenantId
        }, {
            deletedAt: new Date(),
            updatedBy: userId
        });
    }
    /**
     * Send for approval
     */ async sendForApproval(tenantId, id, userId) {
        const calculation = await this.findById(tenantId, id);
        if (calculation.status !== 'draft') {
            throw new _common.BadRequestException('Тільки чернети можна відправити на затвердження');
        }
        calculation.status = 'pending_approval';
        calculation.updatedBy = userId;
        // TODO: Send notification to owner
        await this.calculationRepository.save(calculation);
        return calculation;
    }
    /**
     * Approve calculation
     */ async approve(tenantId, id, userId, dto) {
        const calculation = await this.findById(tenantId, id);
        if (calculation.status !== 'pending_approval') {
            throw new _common.BadRequestException('Розрахунок не очікує затвердження');
        }
        calculation.status = 'approved';
        calculation.approvedBy = userId;
        calculation.updatedBy = userId;
        return this.calculationRepository.save(calculation);
    }
    /**
     * Reject calculation
     */ async reject(tenantId, id, userId, dto) {
        const calculation = await this.findById(tenantId, id);
        if (calculation.status !== 'pending_approval') {
            throw new _common.BadRequestException('Розрахунок не очікує затвердження');
        }
        calculation.status = 'rejected';
        calculation.updatedBy = userId;
        // Add rejection reason to notes
        calculation.internalNotes = `[REJECTED] ${dto.reason}`;
        return this.calculationRepository.save(calculation);
    }
    /**
     * Generate PDF
     */ async generatePdf(tenantId, id, dto) {
        const calculation = await this.findById(tenantId, id);
        // TODO: Generate PDF using template service
        const pdfUrl = `https://cdn.laworganizer.ua/calculations/${id}.pdf`;
        const pdfGeneratedAt = new Date();
        calculation.pdfUrl = pdfUrl;
        calculation.pdfGeneratedAt = pdfGeneratedAt;
        calculation.updatedBy = dto.userId;
        await this.calculationRepository.save(calculation);
        return {
            pdfUrl,
            pdfGeneratedAt
        };
    }
    /**
     * Export calculation
     */ async exportToExcel(tenantId, id) {
        const calculation = await this.findById(tenantId, id);
        // TODO: Generate Excel export
        const excelData = Buffer.from('Excel data');
        return excelData;
    }
    /**
     * Get calculation statistics
     */ async getStatistics(tenantId) {
        const [total] = await this.calculationRepository.createQueryBuilder('calculation').select('COUNT(*)').where('calculation.tenantId = :tenantId AND calculation.deletedAt IS NULL', {
            tenantId
        }).getRawMany();
        const [byStatus] = await this.calculationRepository.createQueryBuilder('calculation').select('calculation.status', 'COUNT(*) as count').where('calculation.tenantId = :tenantId AND calculation.deletedAt IS NULL', {
            tenantId
        }).groupBy('calculation.status').getRawMany();
        const [totalAmount] = await this.calculationRepository.createQueryBuilder('calculation').select('SUM(calculation.totalAmount)').where('calculation.tenantId = :tenantId AND calculation.deletedAt IS NULL', {
            tenantId
        }).getRawMany();
        const [paidAmount] = await this.calculationRepository.createQueryBuilder('calculation').select('SUM(calculation.paidAmount)').where('calculation.tenantId = :tenantId AND calculation.deletedAt IS NULL', {
            tenantId
        }).getRawMany();
        const outstandingAmount = (totalAmount[0].sum || 0) - (paidAmount[0].sum || 0);
        return {
            total: parseInt(total[0].count),
            totalAmount: totalAmount[0].sum || 0,
            paidAmount: paidAmount[0].sum || 0,
            outstandingAmount,
            byStatus: byStatus.reduce((acc, row)=>{
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {})
        };
    }
    /**
     * Generate calculation number
     */ async generateCalculationNumber(tenantId) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        // Get latest calculation number for this month/year
        const latest = await this.calculationRepository.createQueryBuilder('calculation').select('calculation.number').where('calculation.tenantId = :tenantId AND calculation.number LIKE :pattern', {
            tenantId,
            pattern: `CALC-${year}-${month}-%`
        }).orderBy('calculation.number', 'DESC').limit(1).getOne();
        let number = 1;
        if (latest) {
            const parts = latest.number.split('-');
            number = parseInt(parts[3]) + 1;
        }
        return `CALC-${year}-${month}-${String(number).padStart(4, '0')}`;
    }
    constructor(calculationRepository, calculationItemRepository, pricelistItemRepository){
        this.calculationRepository = calculationRepository;
        this.calculationItemRepository = calculationItemRepository;
        this.pricelistItemRepository = pricelistItemRepository;
    }
};
CalculationService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_Calculationentity.Calculation)),
    _ts_param(1, (0, _typeorm.InjectRepository)(_CalculationItementity.CalculationItem)),
    _ts_param(2, (0, _typeorm.InjectRepository)(_PricelistItementity.PricelistItem)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], CalculationService);

//# sourceMappingURL=calculation.service.js.map