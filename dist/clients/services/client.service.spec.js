"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _typeorm = require("@nestjs/typeorm");
const _common = require("@nestjs/common");
const _clientservice = require("./client.service");
const _Cliententity = require("../../database/entities/Client.entity");
const _validationutil = /*#__PURE__*/ _interop_require_wildcard(require("../../common/utils/validation.util"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
// Mock validation utilities
jest.mock('../../common/utils/validation.util');
describe('ClientService', ()=>{
    let service;
    let clientRepository;
    const mockTenantId = 'test-tenant-id';
    const mockUserId = 'test-user-id';
    const mockClientId = 'test-client-id';
    const mockClient = {
        id: mockClientId,
        tenantId: mockTenantId,
        type: 'individual',
        firstName: 'Іван',
        lastName: 'Петренко',
        patronymic: 'Іванович',
        email: 'ivan@example.com',
        phone: '+380501234567',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: mockUserId,
        updatedBy: mockUserId
    };
    const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
    };
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _clientservice.ClientService,
                {
                    provide: (0, _typeorm.getRepositoryToken)(_Cliententity.Client),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder)
                    }
                }
            ]
        }).compile();
        service = module.get(_clientservice.ClientService);
        clientRepository = module.get((0, _typeorm.getRepositoryToken)(_Cliententity.Client));
        // Reset mock query builder
        Object.keys(mockQueryBuilder).forEach((key)=>{
            mockQueryBuilder[key].mockClear();
        });
        mockQueryBuilder.where.mockReturnThis();
        mockQueryBuilder.andWhere.mockReturnThis();
        mockQueryBuilder.orderBy.mockReturnThis();
        mockQueryBuilder.skip.mockReturnThis();
        mockQueryBuilder.take.mockReturnThis();
        mockQueryBuilder.leftJoinAndSelect.mockReturnThis();
        mockQueryBuilder.select.mockReturnThis();
    });
    afterEach(()=>{
        jest.clearAllMocks();
    });
    describe('findAll', ()=>{
        it('should return paginated clients', async ()=>{
            const mockClients = [
                mockClient
            ];
            mockQueryBuilder.getManyAndCount.mockResolvedValue([
                mockClients,
                1
            ]);
            const result = await service.findAll(mockTenantId, {});
            expect(result.data).toEqual(mockClients);
            expect(result.total).toBe(1);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(20);
        });
        it('should apply search filter', async ()=>{
            _validationutil.detectSqlInjection.mockReturnValue(false);
            mockQueryBuilder.getManyAndCount.mockResolvedValue([
                [],
                0
            ]);
            await service.findAll(mockTenantId, {
                search: 'Іван'
            });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(expect.stringContaining('client.firstName ILIKE'), {
                search: '%Іван%'
            });
        });
        it('should throw ForbiddenException for SQL injection attempt', async ()=>{
            _validationutil.detectSqlInjection.mockReturnValue(true);
            await expect(service.findAll(mockTenantId, {
                search: "'; DROP TABLE clients; --"
            })).rejects.toThrow(_common.ForbiddenException);
        });
        it('should apply type filter', async ()=>{
            mockQueryBuilder.getManyAndCount.mockResolvedValue([
                [],
                0
            ]);
            await service.findAll(mockTenantId, {
                type: 'individual'
            });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('client.type = :type', {
                type: 'individual'
            });
        });
        it('should apply status filter', async ()=>{
            mockQueryBuilder.getManyAndCount.mockResolvedValue([
                [],
                0
            ]);
            await service.findAll(mockTenantId, {
                status: 'active'
            });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('client.status = :status', {
                status: 'active'
            });
        });
        it('should apply assigned user filter', async ()=>{
            mockQueryBuilder.getManyAndCount.mockResolvedValue([
                [],
                0
            ]);
            await service.findAll(mockTenantId, {
                assignedUserId: mockUserId
            });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('client.assignedUserId = :assignedUserId', {
                assignedUserId: mockUserId
            });
        });
        it('should apply pagination', async ()=>{
            mockQueryBuilder.getManyAndCount.mockResolvedValue([
                [],
                0
            ]);
            await service.findAll(mockTenantId, {
                page: 2,
                limit: 10
            });
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
        });
        it('should apply sorting', async ()=>{
            mockQueryBuilder.getManyAndCount.mockResolvedValue([
                [],
                0
            ]);
            await service.findAll(mockTenantId, {
                sortBy: 'lastName',
                sortOrder: 'ASC'
            });
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('client.lastName', 'ASC');
        });
    });
    describe('findById', ()=>{
        it('should return client by ID', async ()=>{
            clientRepository.findOne.mockResolvedValue(mockClient);
            const result = await service.findById(mockTenantId, mockClientId);
            expect(result).toEqual(mockClient);
            expect(clientRepository.findOne).toHaveBeenCalledWith({
                where: {
                    id: mockClientId,
                    tenantId: mockTenantId,
                    deletedAt: null
                },
                relations: [
                    'assignedUser',
                    'cases'
                ]
            });
        });
        it('should throw NotFoundException for non-existent client', async ()=>{
            clientRepository.findOne.mockResolvedValue(null);
            await expect(service.findById(mockTenantId, mockClientId)).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('create', ()=>{
        const createDto = {
            type: 'individual',
            firstName: 'Іван',
            lastName: 'Петренко',
            email: 'ivan@example.com',
            phone: '+380501234567'
        };
        beforeEach(()=>{
            _validationutil.validateEdrpou.mockReturnValue(true);
            _validationutil.validateTaxNumber.mockReturnValue(true);
        });
        it('should create a new client', async ()=>{
            clientRepository.create.mockReturnValue(mockClient);
            clientRepository.save.mockResolvedValue(mockClient);
            const result = await service.create(mockTenantId, mockUserId, createDto);
            expect(result).toEqual(mockClient);
            expect(clientRepository.create).toHaveBeenCalledWith({
                tenantId: mockTenantId,
                ...createDto,
                createdBy: mockUserId,
                updatedBy: mockUserId
            });
        });
        it('should throw ForbiddenException for invalid EDRPOU', async ()=>{
            _validationutil.validateEdrpou.mockReturnValue(false);
            await expect(service.create(mockTenantId, mockUserId, {
                ...createDto,
                edrpou: 'invalid'
            })).rejects.toThrow(_common.ForbiddenException);
        });
        it('should throw ForbiddenException for invalid INN', async ()=>{
            _validationutil.validateTaxNumber.mockReturnValue(false);
            await expect(service.create(mockTenantId, mockUserId, {
                ...createDto,
                inn: 'invalid'
            })).rejects.toThrow(_common.ForbiddenException);
        });
        it('should create legal entity client', async ()=>{
            const legalEntityDto = {
                type: 'legal_entity',
                companyName: 'ТОВ "Тест"',
                edrpou: '12345678',
                email: 'test@company.com'
            };
            const mockLegalClient = {
                ...mockClient,
                type: 'legal_entity',
                ...legalEntityDto
            };
            clientRepository.create.mockReturnValue(mockLegalClient);
            clientRepository.save.mockResolvedValue(mockLegalClient);
            const result = await service.create(mockTenantId, mockUserId, legalEntityDto);
            expect(result.type).toBe('legal_entity');
        });
    });
    describe('update', ()=>{
        const updateDto = {
            firstName: 'Петро',
            lastName: 'Іваненко'
        };
        beforeEach(()=>{
            _validationutil.validateEdrpou.mockReturnValue(true);
            _validationutil.validateTaxNumber.mockReturnValue(true);
        });
        it('should update existing client', async ()=>{
            clientRepository.findOne.mockResolvedValue(mockClient);
            clientRepository.save.mockResolvedValue({
                ...mockClient,
                ...updateDto
            });
            const result = await service.update(mockTenantId, mockClientId, mockUserId, updateDto);
            expect(result.firstName).toBe('Петро');
            expect(result.lastName).toBe('Іваненко');
        });
        it('should throw NotFoundException for non-existent client', async ()=>{
            clientRepository.findOne.mockResolvedValue(null);
            await expect(service.update(mockTenantId, mockClientId, mockUserId, updateDto)).rejects.toThrow(_common.NotFoundException);
        });
        it('should throw ForbiddenException for invalid EDRPOU', async ()=>{
            clientRepository.findOne.mockResolvedValue(mockClient);
            _validationutil.validateEdrpou.mockReturnValue(false);
            await expect(service.update(mockTenantId, mockClientId, mockUserId, {
                edrpou: 'invalid'
            })).rejects.toThrow(_common.ForbiddenException);
        });
        it('should update client status', async ()=>{
            clientRepository.findOne.mockResolvedValue(mockClient);
            clientRepository.save.mockResolvedValue({
                ...mockClient,
                status: 'inactive'
            });
            const result = await service.update(mockTenantId, mockClientId, mockUserId, {
                status: 'inactive'
            });
            expect(result.status).toBe('inactive');
        });
    });
    describe('delete', ()=>{
        it('should soft delete client', async ()=>{
            clientRepository.findOne.mockResolvedValue(mockClient);
            clientRepository.update.mockResolvedValue({});
            await service.delete(mockTenantId, mockClientId, mockUserId);
            expect(clientRepository.update).toHaveBeenCalledWith({
                id: mockClientId,
                tenantId: mockTenantId
            }, {
                deletedAt: expect.any(Date),
                updatedBy: mockUserId
            });
        });
        it('should throw NotFoundException for non-existent client', async ()=>{
            clientRepository.findOne.mockResolvedValue(null);
            await expect(service.delete(mockTenantId, mockClientId, mockUserId)).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('restore', ()=>{
        it('should restore deleted client', async ()=>{
            clientRepository.update.mockResolvedValue({});
            clientRepository.findOne.mockResolvedValue(mockClient);
            const result = await service.restore(mockTenantId, mockClientId, mockUserId);
            expect(clientRepository.update).toHaveBeenCalledWith({
                id: mockClientId,
                tenantId: mockTenantId
            }, {
                deletedAt: null,
                updatedBy: mockUserId
            });
            expect(result).toEqual(mockClient);
        });
    });
    describe('bulkImport', ()=>{
        const clientsToImport = [
            {
                type: 'individual',
                firstName: 'Іван',
                lastName: 'Петренко'
            },
            {
                type: 'individual',
                firstName: 'Петро',
                lastName: 'Іваненко'
            }
        ];
        beforeEach(()=>{
            _validationutil.validateEdrpou.mockReturnValue(true);
            _validationutil.validateTaxNumber.mockReturnValue(true);
        });
        it('should import multiple clients successfully', async ()=>{
            clientRepository.create.mockReturnValue(mockClient);
            clientRepository.save.mockResolvedValue(mockClient);
            const result = await service.bulkImport(mockTenantId, mockUserId, clientsToImport);
            expect(result.success).toBe(2);
            expect(result.failed).toBe(0);
            expect(result.errors).toHaveLength(0);
        });
        it('should handle partial failures', async ()=>{
            clientRepository.create.mockReturnValue(mockClient);
            clientRepository.save.mockResolvedValueOnce(mockClient).mockRejectedValueOnce(new Error('Database error'));
            const result = await service.bulkImport(mockTenantId, mockUserId, clientsToImport);
            expect(result.success).toBe(1);
            expect(result.failed).toBe(1);
            expect(result.errors).toHaveLength(1);
        });
        it('should handle validation errors', async ()=>{
            const invalidClients = [
                {
                    type: 'legal_entity',
                    edrpou: 'invalid'
                }
            ];
            _validationutil.validateEdrpou.mockReturnValue(false);
            const result = await service.bulkImport(mockTenantId, mockUserId, invalidClients);
            expect(result.success).toBe(0);
            expect(result.failed).toBe(1);
        });
    });
    describe('getStatistics', ()=>{
        it('should return client statistics', async ()=>{
            mockQueryBuilder.getRawMany.mockResolvedValueOnce([
                {
                    count: '100'
                }
            ]).mockResolvedValueOnce([
                {
                    count: '80'
                }
            ]).mockResolvedValueOnce([
                {
                    count: '15'
                }
            ]).mockResolvedValueOnce([
                {
                    count: '60'
                }
            ]).mockResolvedValueOnce([
                {
                    count: '40'
                }
            ]);
            const result = await service.getStatistics(mockTenantId);
            expect(result).toEqual({
                total: 100,
                active: 80,
                inactive: 15,
                individuals: 60,
                legalEntities: 40
            });
        });
        it('should handle empty statistics', async ()=>{
            mockQueryBuilder.getRawMany.mockResolvedValueOnce([
                {
                    count: '0'
                }
            ]).mockResolvedValueOnce([
                {
                    count: '0'
                }
            ]).mockResolvedValueOnce([
                {
                    count: '0'
                }
            ]).mockResolvedValueOnce([
                {
                    count: '0'
                }
            ]).mockResolvedValueOnce([
                {
                    count: '0'
                }
            ]);
            const result = await service.getStatistics(mockTenantId);
            expect(result.total).toBe(0);
        });
    });
});

//# sourceMappingURL=client.service.spec.js.map