"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClientService", {
    enumerable: true,
    get: function() {
        return ClientService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _Cliententity = require("../../database/entities/Client.entity");
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
let ClientService = class ClientService {
    /**
     * Get all clients with filters
     */ async findAll(tenantId, filters = {}) {
        const query = this.clientRepository.createQueryBuilder('client').where('client.tenantId = :tenantId AND client.deletedAt IS NULL', {
            tenantId
        });
        // Search (name, email, phone)
        if (filters.search) {
            // Check for SQL injection
            if ((0, _validationutil.detectSqlInjection)(filters.search)) {
                throw new _common.ForbiddenException('Invalid search query');
            }
            query.andWhere('(client.firstName ILIKE :search OR ' + 'client.lastName ILIKE :search OR ' + 'client.email ILIKE :search OR ' + 'client.phone ILIKE :search OR ' + 'client.companyName ILIKE :search)', {
                search: `%${filters.search}%`
            });
        }
        // Filter by type
        if (filters.type) {
            query.andWhere('client.type = :type', {
                type: filters.type
            });
        }
        // Filter by status
        if (filters.status) {
            query.andWhere('client.status = :status', {
                status: filters.status
            });
        }
        // Filter by assigned user
        if (filters.assignedUserId) {
            query.andWhere('client.assignedUserId = :assignedUserId', {
                assignedUserId: filters.assignedUserId
            });
        }
        // Filter by city
        if (filters.city) {
            query.andWhere('client.city = :city', {
                city: filters.city
            });
        }
        // Filter by region
        if (filters.region) {
            query.andWhere('client.region = :region', {
                region: filters.region
            });
        }
        // Filter by date range
        if (filters.createdAtFrom) {
            query.andWhere('client.createdAt >= :createdAtFrom', {
                createdAtFrom: new Date(filters.createdAtFrom)
            });
        }
        if (filters.createdAtTo) {
            query.andWhere('client.createdAt <= :createdAtTo', {
                createdAtTo: new Date(filters.createdAtTo)
            });
        }
        // Sorting
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'DESC';
        query.orderBy(`client.${sortBy}`, sortOrder);
        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);
        // Include relations
        query.leftJoinAndSelect('client.assignedUser', 'assignedUser');
        const [data, total] = await query.getManyAndCount();
        return {
            data,
            total,
            page,
            limit
        };
    }
    /**
     * Get client by ID
     */ async findById(tenantId, id) {
        const client = await this.clientRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: null
            },
            relations: [
                'assignedUser',
                'cases'
            ]
        });
        if (!client) {
            throw new _common.NotFoundException('Клієнта не знайдено');
        }
        return client;
    }
    /**
     * Create new client
     */ async create(tenantId, userId, dto) {
        // Validate EDRPOU if provided
        if (dto.edrpou && !(0, _validationutil.validateEdrpou)(dto.edrpou)) {
            throw new _common.ForbiddenException('Невірний формат ЄДРПОУ');
        }
        // Validate INN if provided
        if (dto.inn && !(0, _validationutil.validateTaxNumber)(dto.inn)) {
            throw new _common.ForbiddenException('Невірний формат ІПН');
        }
        const client = this.clientRepository.create({
            tenantId,
            ...dto,
            createdBy: userId,
            updatedBy: userId
        });
        return this.clientRepository.save(client);
    }
    /**
     * Update existing client
     */ async update(tenantId, id, userId, dto) {
        const client = await this.findById(tenantId, id);
        // Validate EDRPOU if provided
        if (dto.edrpou && !(0, _validationutil.validateEdrpou)(dto.edrpou)) {
            throw new _common.ForbiddenException('Невірний формат ЄДРПОУ');
        }
        // Validate INN if provided
        if (dto.inn && !(0, _validationutil.validateTaxNumber)(dto.inn)) {
            throw new _common.ForbiddenException('Невірний формат ІПН');
        }
        Object.assign(client, dto, {
            updatedBy: userId
        });
        return this.clientRepository.save(client);
    }
    /**
     * Delete client (soft delete)
     */ async delete(tenantId, id, userId) {
        const client = await this.findById(tenantId, id);
        // Update instead of actual delete
        await this.clientRepository.update({
            id,
            tenantId
        }, {
            deletedAt: new Date(),
            updatedBy: userId
        });
    }
    /**
     * Restore deleted client
     */ async restore(tenantId, id, userId) {
        await this.clientRepository.update({
            id,
            tenantId
        }, {
            deletedAt: null,
            updatedBy: userId
        });
        return this.findById(tenantId, id);
    }
    /**
     * Bulk import clients
     */ async bulkImport(tenantId, userId, dtos) {
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };
        for (const dto of dtos){
            try {
                await this.create(tenantId, userId, dto);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    client: dto,
                    error: error.message
                });
            }
        }
        return results;
    }
    /**
     * Get client statistics
     */ async getStatistics(tenantId) {
        const [total] = await this.clientRepository.createQueryBuilder('client').select('COUNT(*)').where('client.tenantId = :tenantId AND client.deletedAt IS NULL', {
            tenantId
        }).getRawMany();
        const [active] = await this.clientRepository.createQueryBuilder('client').select('COUNT(*)').where('client.tenantId = :tenantId AND client.status = :status AND client.deletedAt IS NULL', {
            tenantId,
            status: 'active'
        }).getRawMany();
        const [inactive] = await this.clientRepository.createQueryBuilder('client').select('COUNT(*)').where('client.tenantId = :tenantId AND client.status = :status AND client.deletedAt IS NULL', {
            tenantId,
            status: 'inactive'
        }).getRawMany();
        const [individuals] = await this.clientRepository.createQueryBuilder('client').select('COUNT(*)').where('client.tenantId = :tenantId AND client.type = :type AND client.deletedAt IS NULL', {
            tenantId,
            type: 'individual'
        }).getRawMany();
        const [legalEntities] = await this.clientRepository.createQueryBuilder('client').select('COUNT(*)').where('client.tenantId = :tenantId AND client.type = :type AND client.deletedAt IS NULL', {
            tenantId,
            type: 'legal_entity'
        }).getRawMany();
        return {
            total: parseInt(total[0].count),
            active: parseInt(active[0].count),
            inactive: parseInt(inactive[0].count),
            individuals: parseInt(individuals[0].count),
            legalEntities: parseInt(legalEntities[0].count)
        };
    }
    constructor(clientRepository){
        this.clientRepository = clientRepository;
    }
};
ClientService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_Cliententity.Client)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], ClientService);

//# sourceMappingURL=client.service.js.map