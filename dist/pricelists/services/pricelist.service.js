"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PricelistService", {
    enumerable: true,
    get: function() {
        return PricelistService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _Pricelistentity = require("../../database/entities/Pricelist.entity");
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
let PricelistService = class PricelistService {
    /**
     * Get all pricelists
     */ async findAll(tenantId, filters = {}) {
        const query = this.pricelistRepository.createQueryBuilder('pricelist').where('pricelist.tenantId = :tenantId AND pricelist.deletedAt IS NULL', {
            tenantId
        });
        // Filter by type
        if (filters.type) {
            query.andWhere('pricelist.type = :type', {
                type: filters.type
            });
        }
        // Filter by status
        if (filters.status) {
            query.andWhere('pricelist.status = :status', {
                status: filters.status
            });
        }
        // Filter by default
        if (filters.isDefault !== undefined) {
            query.andWhere('pricelist.isDefault = :isDefault', {
                isDefault: filters.isDefault
            });
        }
        // Search
        if (filters.search) {
            query.andWhere('pricelist.name ILIKE :search', {
                search: `%${filters.search}%`
            });
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
            limit
        };
    }
    /**
     * Get pricelist by ID with items
     */ async findById(tenantId, id) {
        const pricelist = await this.pricelistRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: null
            },
            relations: [
                'items'
            ],
            order: {
                items: {
                    displayOrder: 'ASC'
                }
            }
        });
        if (!pricelist) {
            throw new _common.NotFoundException('Прайс-лист не знайдено');
        }
        return pricelist;
    }
    /**
     * Create new pricelist
     */ async create(tenantId, userId, dto) {
        const pricelist = this.pricelistRepository.create({
            tenantId,
            ...dto,
            createdBy: userId,
            updatedBy: userId
        });
        return this.pricelistRepository.save(pricelist);
    }
    /**
     * Update pricelist
     */ async update(tenantId, id, userId, dto) {
        const pricelist = await this.findById(tenantId, id);
        Object.assign(pricelist, dto, {
            updatedBy: userId
        });
        return this.pricelistRepository.save(pricelist);
    }
    /**
     * Delete pricelist (soft delete)
     */ async delete(tenantId, id, userId) {
        const pricelist = await this.findById(tenantId, id);
        await this.pricelistRepository.update({
            id,
            tenantId
        }, {
            deletedAt: new Date(),
            updatedBy: userId,
            status: 'archived'
        });
    }
    /**
     * Add item to pricelist
     */ async addItem(tenantId, userId, pricelistId, dto) {
        const item = this.pricelistItemRepository.create({
            tenantId,
            pricelistId,
            ...dto,
            createdBy: userId,
            updatedBy: userId
        });
        return this.pricelistItemRepository.save(item);
    }
    /**
     * Update item in pricelist
     */ async updateItem(tenantId, id, userId, dto) {
        const item = await this.pricelistItemRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: null
            }
        });
        if (!item) {
            throw new _common.NotFoundException('Позицію прайс-листа не знайдено');
        }
        Object.assign(item, dto, {
            updatedBy: userId
        });
        return this.pricelistItemRepository.save(item);
    }
    /**
     * Delete item from pricelist
     */ async deleteItem(tenantId, id, userId) {
        await this.pricelistItemRepository.delete({
            id,
            tenantId
        });
    }
    /**
     * Get available items by category
     */ async getItemsByCategory(tenantId, category) {
        return this.pricelistItemRepository.createQueryBuilder('item').innerJoin('item.pricelist', 'pricelist').where('pricelist.tenantId = :tenantId AND ' + 'item.category = :category AND ' + 'item.isActive = :isActive AND ' + 'pricelist.status = :status AND ' + 'pricelist.deletedAt IS NULL AND ' + 'item.deletedAt IS NULL', {
            tenantId,
            category,
            isActive: true,
            status: 'active'
        }).orderBy('item.displayOrder', 'ASC').getMany();
    }
    /**
     * Get default pricelist
     */ async getDefaultPricelist(tenantId) {
        return this.pricelistRepository.findOne({
            where: {
                tenantId,
                isDefault: true,
                status: 'active',
                deletedAt: null
            },
            relations: [
                'items'
            ]
        });
    }
    constructor(pricelistRepository, pricelistItemRepository){
        this.pricelistRepository = pricelistRepository;
        this.pricelistItemRepository = pricelistItemRepository;
    }
};
PricelistService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_Pricelistentity.Pricelist)),
    _ts_param(1, (0, _typeorm.InjectRepository)(_PricelistItementity.PricelistItem)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], PricelistService);

//# sourceMappingURL=pricelist.service.js.map