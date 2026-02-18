import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Pricelist } from '../../database/entities/Pricelist.entity';
import { PricelistItem } from '../../database/entities/PricelistItem.entity';
import {
    CreatePricelistDto,
    UpdatePricelistDto,
    CreatePricelistItemDto,
    UpdatePricelistItemDto,
    PricelistFiltersDto,
} from '../dto/pricelist.dto';

/**
 * Pricelist Service
 */
@Injectable()
export class PricelistService {
    constructor(
        @InjectRepository(Pricelist)
        private readonly pricelistRepository: Repository<Pricelist>,
        @InjectRepository(PricelistItem)
        private readonly pricelistItemRepository: Repository<PricelistItem>,
    ) {}

    /**
     * Get all pricelists
     */
    async findAll(
        tenantId: string,
        filters: PricelistFiltersDto = {}
    ): Promise<{ data: Pricelist[]; total: number; page: number; limit: number }> {
        const query = this.pricelistRepository
            .createQueryBuilder('pricelist')
            .where('pricelist.tenantId = :tenantId AND pricelist.deletedAt IS NULL', { tenantId });

        // Filter by type
        if (filters.type) {
            query.andWhere('pricelist.type = :type', { type: filters.type });
        }

        // Filter by status
        if (filters.status) {
            query.andWhere('pricelist.status = :status', { status: filters.status });
        }

        // Filter by default
        if (filters.isDefault !== undefined) {
            query.andWhere('pricelist.isDefault = :isDefault', { isDefault: filters.isDefault });
        }

        // Search
        if (filters.search) {
            query.andWhere('pricelist.name ILIKE :search', { search: `%${filters.search}%` });
        }

        // Sorting
        query.orderBy('pricelist.createdAt', 'DESC');

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        query.skip(skip).take(limit);

        // Include items
        query.leftJoinAndSelect('pricelist.items', 'items');

        const [data, total] = await query.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
        };
    }

    /**
     * Get pricelist by ID with items
     */
    async findById(tenantId: string, id: string): Promise<Pricelist> {
        const pricelist = await this.pricelistRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: IsNull(),
            },
            relations: ['items'],
            order: {
                items: {
                    displayOrder: 'ASC',
                },
            },
        });

        if (!pricelist) {
            throw new NotFoundException('Прайс-лист не знайдено');
        }

        return pricelist;
    }

    /**
     * Create new pricelist
     */
    async create(
        tenantId: string,
        userId: string,
        dto: CreatePricelistDto
    ): Promise<Pricelist> {
        const pricelist = this.pricelistRepository.create({
            tenantId,
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });

        return this.pricelistRepository.save(pricelist);
    }

    /**
     * Update pricelist
     */
    async update(
        tenantId: string,
        id: string,
        userId: string,
        dto: UpdatePricelistDto
    ): Promise<Pricelist> {
        const pricelist = await this.findById(tenantId, id);

        Object.assign(pricelist, dto, {
            updatedBy: userId,
        });

        return this.pricelistRepository.save(pricelist);
    }

    /**
     * Delete pricelist (soft delete)
     */
    async delete(tenantId: string, id: string, userId: string): Promise<void> {
        const pricelist = await this.findById(tenantId, id);

        await this.pricelistRepository.update(
            { id, tenantId },
            {
                deletedAt: new Date(),
                updatedBy: userId,
                status: 'archived',
            }
        );
    }

    /**
     * Add item to pricelist
     */
    async addItem(
        tenantId: string,
        userId: string,
        pricelistId: string,
        dto: CreatePricelistItemDto
    ): Promise<PricelistItem> {
        const item = this.pricelistItemRepository.create({
            tenantId,
            pricelistId,
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });

        return this.pricelistItemRepository.save(item);
    }

    /**
     * Update item in pricelist
     */
    async updateItem(
        tenantId: string,
        id: string,
        userId: string,
        dto: UpdatePricelistItemDto
    ): Promise<PricelistItem> {
        const item = await this.pricelistItemRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: IsNull(),
            },
        });

        if (!item) {
            throw new NotFoundException('Позицію прайс-листа не знайдено');
        }

        Object.assign(item, dto, {
            updatedBy: userId,
        });

        return this.pricelistItemRepository.save(item);
    }

    /**
     * Delete item from pricelist
     */
    async deleteItem(tenantId: string, id: string, userId: string): Promise<void> {
        await this.pricelistItemRepository.delete({
            id,
            tenantId,
        });
    }

    /**
     * Get available items by category
     */
    async getItemsByCategory(
        tenantId: string,
        category: string
    ): Promise<PricelistItem[]> {
        return this.pricelistItemRepository
            .createQueryBuilder('item')
            .innerJoin('item.pricelist', 'pricelist')
            .where(
                'pricelist.tenantId = :tenantId AND ' +
                'item.category = :category AND ' +
                'item.isActive = :isActive AND ' +
                'pricelist.status = :status AND ' +
                'pricelist.deletedAt IS NULL AND ' +
                'item.deletedAt IS NULL',
                { tenantId, category, isActive: true, status: 'active' }
            )
            .orderBy('item.displayOrder', 'ASC')
            .getMany();
    }

    /**
     * Get default pricelist
     */
    async getDefaultPricelist(tenantId: string): Promise<Pricelist | null> {
        return this.pricelistRepository.findOne({
            where: {
                tenantId,
                isDefault: true,
                status: 'active',
                deletedAt: IsNull(),
            },
            relations: ['items'],
        });
    }
}
