import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ClientService } from './client.service';
import { Client } from '../../database/entities/Client.entity';
import * as validationUtil from '../../common/utils/validation.util';

// Mock validation utilities
jest.mock('../../common/utils/validation.util');

describe('ClientService', () => {
    let service: ClientService;
    let clientRepository: jest.Mocked<Repository<Client>>;

    const mockTenantId = 'test-tenant-id';
    const mockUserId = 'test-user-id';
    const mockClientId = 'test-client-id';

    const mockClient: Client = {
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
        updatedBy: mockUserId,
    } as Client;

    const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClientService,
                {
                    provide: getRepositoryToken(Client),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
                    },
                },
            ],
        }).compile();

        service = module.get<ClientService>(ClientService);
        clientRepository = module.get(getRepositoryToken(Client));

        // Reset mock query builder
        Object.keys(mockQueryBuilder).forEach(key => {
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

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return paginated clients', async () => {
            const mockClients = [mockClient];
            mockQueryBuilder.getManyAndCount.mockResolvedValue([mockClients, 1]);

            const result = await service.findAll(mockTenantId, {});

            expect(result.data).toEqual(mockClients);
            expect(result.total).toBe(1);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(20);
        });

        it('should apply search filter', async () => {
            (validationUtil.detectSqlInjection as jest.Mock).mockReturnValue(false);
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            await service.findAll(mockTenantId, { search: 'Іван' });

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                expect.stringContaining('client.firstName ILIKE'),
                { search: '%Іван%' }
            );
        });

        it('should throw ForbiddenException for SQL injection attempt', async () => {
            (validationUtil.detectSqlInjection as jest.Mock).mockReturnValue(true);

            await expect(service.findAll(mockTenantId, { search: "'; DROP TABLE clients; --" }))
                .rejects.toThrow(ForbiddenException);
        });

        it('should apply type filter', async () => {
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            await service.findAll(mockTenantId, { type: 'individual' });

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                'client.type = :type',
                { type: 'individual' }
            );
        });

        it('should apply status filter', async () => {
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            await service.findAll(mockTenantId, { status: 'active' });

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                'client.status = :status',
                { status: 'active' }
            );
        });

        it('should apply assigned user filter', async () => {
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            await service.findAll(mockTenantId, { assignedUserId: mockUserId });

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                'client.assignedUserId = :assignedUserId',
                { assignedUserId: mockUserId }
            );
        });

        it('should apply pagination', async () => {
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            await service.findAll(mockTenantId, { page: 2, limit: 10 });

            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
        });

        it('should apply sorting', async () => {
            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            await service.findAll(mockTenantId, { sortBy: 'lastName', sortOrder: 'ASC' });

            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('client.lastName', 'ASC');
        });
    });

    describe('findById', () => {
        it('should return client by ID', async () => {
            clientRepository.findOne.mockResolvedValue(mockClient);

            const result = await service.findById(mockTenantId, mockClientId);

            expect(result).toEqual(mockClient);
            expect(clientRepository.findOne).toHaveBeenCalledWith({
                where: {
                    id: mockClientId,
                    tenantId: mockTenantId,
                    deletedAt: null,
                },
                relations: ['assignedUser', 'cases'],
            });
        });

        it('should throw NotFoundException for non-existent client', async () => {
            clientRepository.findOne.mockResolvedValue(null);

            await expect(service.findById(mockTenantId, mockClientId))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        const createDto = {
            type: 'individual' as const,
            firstName: 'Іван',
            lastName: 'Петренко',
            email: 'ivan@example.com',
            phone: '+380501234567',
        };

        beforeEach(() => {
            (validationUtil.validateEdrpou as jest.Mock).mockReturnValue(true);
            (validationUtil.validateTaxNumber as jest.Mock).mockReturnValue(true);
        });

        it('should create a new client', async () => {
            clientRepository.create.mockReturnValue(mockClient);
            clientRepository.save.mockResolvedValue(mockClient);

            const result = await service.create(mockTenantId, mockUserId, createDto);

            expect(result).toEqual(mockClient);
            expect(clientRepository.create).toHaveBeenCalledWith({
                tenantId: mockTenantId,
                ...createDto,
                createdBy: mockUserId,
                updatedBy: mockUserId,
            });
        });

        it('should throw ForbiddenException for invalid EDRPOU', async () => {
            (validationUtil.validateEdrpou as jest.Mock).mockReturnValue(false);

            await expect(service.create(mockTenantId, mockUserId, {
                ...createDto,
                edrpou: 'invalid',
            })).rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException for invalid INN', async () => {
            (validationUtil.validateTaxNumber as jest.Mock).mockReturnValue(false);

            await expect(service.create(mockTenantId, mockUserId, {
                ...createDto,
                inn: 'invalid',
            })).rejects.toThrow(ForbiddenException);
        });

        it('should create legal entity client', async () => {
            const legalEntityDto = {
                type: 'legal_entity' as const,
                companyName: 'ТОВ "Тест"',
                edrpou: '12345678',
                email: 'test@company.com',
            };
            const mockLegalClient = { ...mockClient, type: 'legal_entity', ...legalEntityDto };
            clientRepository.create.mockReturnValue(mockLegalClient);
            clientRepository.save.mockResolvedValue(mockLegalClient);

            const result = await service.create(mockTenantId, mockUserId, legalEntityDto);

            expect(result.type).toBe('legal_entity');
        });
    });

    describe('update', () => {
        const updateDto = {
            firstName: 'Петро',
            lastName: 'Іваненко',
        };

        beforeEach(() => {
            (validationUtil.validateEdrpou as jest.Mock).mockReturnValue(true);
            (validationUtil.validateTaxNumber as jest.Mock).mockReturnValue(true);
        });

        it('should update existing client', async () => {
            clientRepository.findOne.mockResolvedValue(mockClient);
            clientRepository.save.mockResolvedValue({ ...mockClient, ...updateDto });

            const result = await service.update(mockTenantId, mockClientId, mockUserId, updateDto);

            expect(result.firstName).toBe('Петро');
            expect(result.lastName).toBe('Іваненко');
        });

        it('should throw NotFoundException for non-existent client', async () => {
            clientRepository.findOne.mockResolvedValue(null);

            await expect(service.update(mockTenantId, mockClientId, mockUserId, updateDto))
                .rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException for invalid EDRPOU', async () => {
            clientRepository.findOne.mockResolvedValue(mockClient);
            (validationUtil.validateEdrpou as jest.Mock).mockReturnValue(false);

            await expect(service.update(mockTenantId, mockClientId, mockUserId, {
                edrpou: 'invalid',
            })).rejects.toThrow(ForbiddenException);
        });

        it('should update client status', async () => {
            clientRepository.findOne.mockResolvedValue(mockClient);
            clientRepository.save.mockResolvedValue({ ...mockClient, status: 'inactive' });

            const result = await service.update(mockTenantId, mockClientId, mockUserId, {
                status: 'inactive',
            });

            expect(result.status).toBe('inactive');
        });
    });

    describe('delete', () => {
        it('should soft delete client', async () => {
            clientRepository.findOne.mockResolvedValue(mockClient);
            clientRepository.update.mockResolvedValue({} as any);

            await service.delete(mockTenantId, mockClientId, mockUserId);

            expect(clientRepository.update).toHaveBeenCalledWith(
                { id: mockClientId, tenantId: mockTenantId },
                {
                    deletedAt: expect.any(Date),
                    updatedBy: mockUserId,
                }
            );
        });

        it('should throw NotFoundException for non-existent client', async () => {
            clientRepository.findOne.mockResolvedValue(null);

            await expect(service.delete(mockTenantId, mockClientId, mockUserId))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('restore', () => {
        it('should restore deleted client', async () => {
            clientRepository.update.mockResolvedValue({} as any);
            clientRepository.findOne.mockResolvedValue(mockClient);

            const result = await service.restore(mockTenantId, mockClientId, mockUserId);

            expect(clientRepository.update).toHaveBeenCalledWith(
                { id: mockClientId, tenantId: mockTenantId },
                {
                    deletedAt: null,
                    updatedBy: mockUserId,
                }
            );
            expect(result).toEqual(mockClient);
        });
    });

    describe('bulkImport', () => {
        const clientsToImport = [
            { type: 'individual' as const, firstName: 'Іван', lastName: 'Петренко' },
            { type: 'individual' as const, firstName: 'Петро', lastName: 'Іваненко' },
        ];

        beforeEach(() => {
            (validationUtil.validateEdrpou as jest.Mock).mockReturnValue(true);
            (validationUtil.validateTaxNumber as jest.Mock).mockReturnValue(true);
        });

        it('should import multiple clients successfully', async () => {
            clientRepository.create.mockReturnValue(mockClient);
            clientRepository.save.mockResolvedValue(mockClient);

            const result = await service.bulkImport(mockTenantId, mockUserId, clientsToImport);

            expect(result.success).toBe(2);
            expect(result.failed).toBe(0);
            expect(result.errors).toHaveLength(0);
        });

        it('should handle partial failures', async () => {
            clientRepository.create.mockReturnValue(mockClient);
            clientRepository.save
                .mockResolvedValueOnce(mockClient)
                .mockRejectedValueOnce(new Error('Database error'));

            const result = await service.bulkImport(mockTenantId, mockUserId, clientsToImport);

            expect(result.success).toBe(1);
            expect(result.failed).toBe(1);
            expect(result.errors).toHaveLength(1);
        });

        it('should handle validation errors', async () => {
            const invalidClients = [
                { type: 'legal_entity' as const, edrpou: 'invalid' },
            ];
            (validationUtil.validateEdrpou as jest.Mock).mockReturnValue(false);

            const result = await service.bulkImport(mockTenantId, mockUserId, invalidClients);

            expect(result.success).toBe(0);
            expect(result.failed).toBe(1);
        });
    });

    describe('getStatistics', () => {
        it('should return client statistics', async () => {
            mockQueryBuilder.getRawMany
                .mockResolvedValueOnce([{ count: '100' }])
                .mockResolvedValueOnce([{ count: '80' }])
                .mockResolvedValueOnce([{ count: '15' }])
                .mockResolvedValueOnce([{ count: '60' }])
                .mockResolvedValueOnce([{ count: '40' }]);

            const result = await service.getStatistics(mockTenantId);

            expect(result).toEqual({
                total: 100,
                active: 80,
                inactive: 15,
                individuals: 60,
                legalEntities: 40,
            });
        });

        it('should handle empty statistics', async () => {
            mockQueryBuilder.getRawMany
                .mockResolvedValueOnce([{ count: '0' }])
                .mockResolvedValueOnce([{ count: '0' }])
                .mockResolvedValueOnce([{ count: '0' }])
                .mockResolvedValueOnce([{ count: '0' }])
                .mockResolvedValueOnce([{ count: '0' }]);

            const result = await service.getStatistics(mockTenantId);

            expect(result.total).toBe(0);
        });
    });
});
