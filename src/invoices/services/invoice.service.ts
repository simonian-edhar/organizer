import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Invoice } from '../../database/entities/Invoice.entity';
import {
    CreateInvoiceDto,
    UpdateInvoiceDto,
    InvoiceFiltersDto,
    GenerateInvoicePdfDto,
} from '../dto/invoice.dto';

/**
 * Invoice Service
 */
@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
    ) {}

    /**
     * Get all invoices with filters
     */
    async findAll(
        tenantId: string,
        filters: InvoiceFiltersDto = {}
    ): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> {
        const query = this.invoiceRepository
            .createQueryBuilder('invoice')
            .where('invoice.tenantId = :tenantId AND invoice.deletedAt IS NULL', { tenantId });

        // Filter by client
        if (filters.clientId) {
            query.andWhere('invoice.clientId = :clientId', { clientId: filters.clientId });
        }

        // Filter by status
        if (filters.status) {
            query.andWhere('invoice.status = :status', { status: filters.status });
        }

        // Filter by date range
        if (filters.invoiceDateFrom && filters.invoiceDateTo) {
            query.andWhere('invoice.invoiceDate BETWEEN :invoiceDateFrom AND :invoiceDateTo', {
                invoiceDateFrom: new Date(filters.invoiceDateFrom),
                invoiceDateTo: new Date(filters.invoiceDateTo),
            });
        } else if (filters.invoiceDateFrom) {
            query.andWhere('invoice.invoiceDate >= :invoiceDateFrom', {
                invoiceDateFrom: new Date(filters.invoiceDateFrom),
            });
        } else if (filters.invoiceDateTo) {
            query.andWhere('invoice.invoiceDate <= :invoiceDateTo', {
                invoiceDateTo: new Date(filters.invoiceDateTo),
            });
        }

        // Search
        if (filters.search) {
            query.andWhere(
                '(invoice.invoiceNumber ILIKE :search OR ' +
                'invoice.description ILIKE :search)',
                { search: `%${filters.search}%` }
            );
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
            limit,
        };
    }

    /**
     * Get invoice by ID
     */
    async findById(tenantId: string, id: string): Promise<Invoice> {
        const invoice = await this.invoiceRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: IsNull(),
            },
            relations: ['items'],
        });

        if (!invoice) {
            throw new NotFoundException('Рахунок не знайдено');
        }

        return invoice;
    }

    /**
     * Create new invoice
     */
    async create(
        tenantId: string,
        userId: string,
        dto: CreateInvoiceDto
    ): Promise<Invoice> {
        // Generate invoice number
        const invoiceNumber = await this.generateInvoiceNumber(tenantId);

        const invoice = this.invoiceRepository.create({
            tenantId,
            ...dto,
            invoiceNumber,
            status: 'draft',
            createdBy: userId,
            updatedBy: userId,
        });

        return this.invoiceRepository.save(invoice);
    }

    /**
     * Update invoice
     */
    async update(
        tenantId: string,
        id: string,
        userId: string,
        dto: UpdateInvoiceDto
    ): Promise<Invoice> {
        const invoice = await this.findById(tenantId, id);

        Object.assign(invoice, dto, {
            updatedBy: userId,
        });

        return this.invoiceRepository.save(invoice);
    }

    /**
     * Delete invoice (soft delete)
     */
    async delete(tenantId: string, id: string, userId: string): Promise<void> {
        const invoice = await this.findById(tenantId, id);

        await this.invoiceRepository.update(
            { id, tenantId },
            {
                deletedAt: new Date(),
                updatedBy: userId,
                status: 'cancelled',
            }
        );
    }

    /**
     * Send invoice
     */
    async send(tenantId: string, id: string, userId: string): Promise<Invoice> {
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
     */
    async generatePdf(
        tenantId: string,
        id: string,
        dto: GenerateInvoicePdfDto
    ): Promise<{ pdfUrl: string; pdfGeneratedAt: Date }> {
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

        return { pdfUrl, pdfGeneratedAt };
    }

    /**
     * Record payment
     */
    async recordPayment(
        tenantId: string,
        id: string,
        userId: string,
        payment: {
            amount: number;
            method: 'cash' | 'card' | 'bank_transfer' | 'wayforpay';
            reference?: string;
        }
    ): Promise<Invoice> {
        const invoice = await this.findById(tenantId, id);

        const paidAmount = invoice.paidAmount + payment.amount;
        const isFullyPaid = paidAmount >= invoice.totalAmount;

        invoice.paidAmount = paidAmount;
        invoice.paymentMethod = payment.method;
        invoice.paymentReference = payment.reference ?? '';
        invoice.paidAt = new Date();
        invoice.status = isFullyPaid ? 'paid' : 'partial';
        invoice.updatedBy = userId;

        return this.invoiceRepository.save(invoice);
    }

    /**
     * Generate invoice number
     */
    private async generateInvoiceNumber(tenantId: string): Promise<string> {
        const prefix = 'INV';
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // Get latest invoice number for this month/year
        const latest = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('invoice.invoiceNumber')
            .where('invoice.tenantId = :tenantId AND invoice.invoiceNumber LIKE :pattern', {
                tenantId,
                pattern: `${prefix}-${year}-${month}-%`,
            })
            .orderBy('invoice.invoiceNumber', 'DESC')
            .limit(1)
            .getOne();

        let number = 1;
        if (latest) {
            const parts = latest.invoiceNumber.split('-');
            number = parseInt(parts[3]) + 1;
        }

        return `${prefix}-${year}-${month}-${String(number).padStart(4, '0')}`;
    }

    /**
     * Get invoice statistics
     */
    async getStatistics(tenantId: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        totalAmount: number;
        paidAmount: number;
        outstandingAmount: number;
        overdueCount: number;
    }> {
        const now = new Date();

        const [total] = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('COUNT(*)')
            .where('invoice.tenantId = :tenantId AND invoice.deletedAt IS NULL', { tenantId })
            .getRawMany();

        const [byStatus] = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('invoice.status', 'COUNT(*) as count')
            .where('invoice.tenantId = :tenantId AND invoice.deletedAt IS NULL', { tenantId })
            .groupBy('invoice.status')
            .getRawMany();

        const [totalAmount] = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('SUM(invoice.totalAmount)')
            .where('invoice.tenantId = :tenantId AND invoice.deletedAt IS NULL', { tenantId })
            .getRawMany();

        const [paidAmount] = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('SUM(invoice.paidAmount)')
            .where('invoice.tenantId = :tenantId AND invoice.deletedAt IS NULL', { tenantId })
            .getRawMany();

        const outstandingAmount = (totalAmount[0].sum || 0) - (paidAmount[0].sum || 0);

        const [overdueCount] = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('COUNT(*)')
            .where(
                'invoice.tenantId = :tenantId AND ' +
                'invoice.status != :paid AND ' +
                'invoice.status != :cancelled AND ' +
                'invoice.dueDate < :now AND ' +
                'invoice.deletedAt IS NULL',
                { tenantId, paid: 'paid', cancelled: now }
            )
            .getRawMany();

        return {
            total: parseInt(total[0].count),
            totalAmount: totalAmount[0].sum || 0,
            paidAmount: paidAmount[0].sum || 0,
            outstandingAmount,
            overdueCount: parseInt(overdueCount[0].count),
            byStatus: byStatus.reduce((acc: Record<string, number>, row: { status: string; count: string }) => {
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {} as Record<string, number>),
        };
    }
}
