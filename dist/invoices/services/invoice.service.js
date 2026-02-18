"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoiceService", {
    enumerable: true,
    get: function() {
        return InvoiceService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _Invoiceentity = require("../../database/entities/Invoice.entity");
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
let InvoiceService = class InvoiceService {
    /**
     * Get all invoices with filters
     */ async findAll(tenantId, filters = {}) {
        const query = this.invoiceRepository.createQueryBuilder('invoice').where('invoice.tenantId = :tenantId AND invoice.deletedAt IS NULL', {
            tenantId
        });
        // Filter by client
        if (filters.clientId) {
            query.andWhere('invoice.clientId = :clientId', {
                clientId: filters.clientId
            });
        }
        // Filter by status
        if (filters.status) {
            query.andWhere('invoice.status = :status', {
                status: filters.status
            });
        }
        // Filter by date range
        if (filters.invoiceDateFrom && filters.invoiceDateTo) {
            query.andWhere('invoice.invoiceDate BETWEEN :invoiceDateFrom AND :invoiceDateTo', {
                invoiceDateFrom: new Date(filters.invoiceDateFrom),
                invoiceDateTo: new Date(filters.invoiceDateTo)
            });
        } else if (filters.invoiceDateFrom) {
            query.andWhere('invoice.invoiceDate >= :invoiceDateFrom', {
                invoiceDateFrom: new Date(filters.invoiceDateFrom)
            });
        } else if (filters.invoiceDateTo) {
            query.andWhere('invoice.invoiceDate <= :invoiceDateTo', {
                invoiceDateTo: new Date(filters.invoiceDateTo)
            });
        }
        // Search
        if (filters.search) {
            query.andWhere('(invoice.invoiceNumber ILIKE :search OR ' + 'invoice.description ILIKE :search)', {
                search: `%${filters.search}%`
            });
        }
        // Sorting
        const sortBy = filters.sortBy || 'invoiceDate';
        const sortOrder = filters.sortOrder || 'DESC';
        query.orderBy(`invoice.${sortBy}`, sortOrder);
        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);
        const [data, total] = await query.getManyAndCount();
        return {
            data,
            total,
            page,
            limit
        };
    }
    /**
     * Get invoice by ID
     */ async findById(tenantId, id) {
        const invoice = await this.invoiceRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: null
            },
            relations: [
                'items'
            ]
        });
        if (!invoice) {
            throw new _common.NotFoundException('Рахунок не знайдено');
        }
        return invoice;
    }
    /**
     * Create new invoice
     */ async create(tenantId, userId, dto) {
        // Generate invoice number
        const invoiceNumber = await this.generateInvoiceNumber(tenantId);
        const invoice = this.invoiceRepository.create({
            tenantId,
            ...dto,
            invoiceNumber,
            status: 'draft',
            createdBy: userId,
            updatedBy: userId
        });
        return this.invoiceRepository.save(invoice);
    }
    /**
     * Update invoice
     */ async update(tenantId, id, userId, dto) {
        const invoice = await this.findById(tenantId, id);
        Object.assign(invoice, dto, {
            updatedBy: userId
        });
        return this.invoiceRepository.save(invoice);
    }
    /**
     * Delete invoice (soft delete)
     */ async delete(tenantId, id, userId) {
        const invoice = await this.findById(tenantId, id);
        await this.invoiceRepository.update({
            id,
            tenantId
        }, {
            deletedAt: new Date(),
            updatedBy: userId,
            status: 'cancelled'
        });
    }
    /**
     * Send invoice
     */ async send(tenantId, id, userId) {
        const invoice = await this.findById(tenantId, id);
        // TODO: Send email/SMS to client
        // TODO: Generate PDF
        // TODO: Update status to 'sent'
        invoice.status = 'sent';
        invoice.updatedBy = userId;
        return this.invoiceRepository.save(invoice);
    }
    /**
     * Generate invoice PDF
     */ async generatePdf(tenantId, id, dto) {
        const invoice = await this.findById(tenantId, id);
        // TODO: Generate PDF using template service
        // TODO: Store PDF in S3/MinIO
        // TODO: Update invoice with pdfUrl and pdfGeneratedAt
        const pdfUrl = `https://cdn.laworganizer.ua/invoices/${id}.pdf`;
        const pdfGeneratedAt = new Date();
        invoice.pdfUrl = pdfUrl;
        invoice.pdfGeneratedAt = pdfGeneratedAt;
        invoice.updatedBy = dto.userId;
        await this.invoiceRepository.save(invoice);
        return {
            pdfUrl,
            pdfGeneratedAt
        };
    }
    /**
     * Record payment
     */ async recordPayment(tenantId, id, userId, payment) {
        const invoice = await this.findById(tenantId, id);
        const paidAmount = invoice.paidAmount + payment.amount;
        const isFullyPaid = paidAmount >= invoice.totalAmount;
        invoice.paidAmount = paidAmount;
        invoice.paymentMethod = payment.method;
        invoice.paymentReference = payment.reference;
        invoice.paidAt = new Date();
        invoice.status = isFullyPaid ? 'paid' : 'partial';
        invoice.updatedBy = userId;
        return this.invoiceRepository.save(invoice);
    }
    /**
     * Generate invoice number
     */ async generateInvoiceNumber(tenantId) {
        const prefix = 'INV';
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        // Get latest invoice number for this month/year
        const latest = await this.invoiceRepository.createQueryBuilder('invoice').select('invoice.invoiceNumber').where('invoice.tenantId = :tenantId AND invoice.invoiceNumber LIKE :pattern', {
            tenantId,
            pattern: `${prefix}-${year}-${month}-%`
        }).orderBy('invoice.invoiceNumber', 'DESC').limit(1).getOne();
        let number = 1;
        if (latest) {
            const parts = latest.invoiceNumber.split('-');
            number = parseInt(parts[3]) + 1;
        }
        return `${prefix}-${year}-${month}-${String(number).padStart(4, '0')}`;
    }
    /**
     * Get invoice statistics
     */ async getStatistics(tenantId) {
        const now = new Date();
        const [total] = await this.invoiceRepository.createQueryBuilder('invoice').select('COUNT(*)').where('invoice.tenantId = :tenantId AND invoice.deletedAt IS NULL', {
            tenantId
        }).getRawMany();
        const [byStatus] = await this.invoiceRepository.createQueryBuilder('invoice').select('invoice.status', 'COUNT(*) as count').where('invoice.tenantId = :tenantId AND invoice.deletedAt IS NULL', {
            tenantId
        }).groupBy('invoice.status').getRawMany();
        const [totalAmount] = await this.invoiceRepository.createQueryBuilder('invoice').select('SUM(invoice.totalAmount)').where('invoice.tenantId = :tenantId AND invoice.deletedAt IS NULL', {
            tenantId
        }).getRawMany();
        const [paidAmount] = await this.invoiceRepository.createQueryBuilder('invoice').select('SUM(invoice.paidAmount)').where('invoice.tenantId = :tenantId AND invoice.deletedAt IS NULL', {
            tenantId
        }).getRawMany();
        const outstandingAmount = (totalAmount[0].sum || 0) - (paidAmount[0].sum || 0);
        const [overdueCount] = await this.invoiceRepository.createQueryBuilder('invoice').select('COUNT(*)').where('invoice.tenantId = :tenantId AND ' + 'invoice.status != :paid AND ' + 'invoice.status != :cancelled AND ' + 'invoice.dueDate < :now AND ' + 'invoice.deletedAt IS NULL', {
            tenantId,
            paid: 'paid',
            cancelled: now
        }).getRawMany();
        return {
            total: parseInt(total[0].count),
            totalAmount: totalAmount[0].sum || 0,
            paidAmount: paidAmount[0].sum || 0,
            outstandingAmount,
            overdueCount: parseInt(overdueCount[0].count),
            byStatus: byStatus.reduce((acc, row)=>{
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {})
        };
    }
    constructor(invoiceRepository){
        this.invoiceRepository = invoiceRepository;
    }
};
InvoiceService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_Invoiceentity.Invoice)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], InvoiceService);

//# sourceMappingURL=invoice.service.js.map