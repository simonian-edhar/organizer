import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Client } from '../../database/entities/Client.entity';
import { CreateClientDto, UpdateClientDto, ClientFiltersDto } from '../dto/client.dto';
import { validateEdrpou, validateTaxNumber, detectSqlInjection } from '../../common/utils/validation.util';

/**
 * Client Service
 */
@Injectable()
export class ClientService {
    constructor(
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
    ) {}

    /**
     * Get all clients with filters
     */
    async findAll(
        tenantId: string,
        filters: ClientFiltersDto = {}
    ): Promise<{ data: Client[]; total: number; page: number; limit: number }> {
        const query = this.clientRepository
            .createQueryBuilder('client')
            .where('client.tenantId = :tenantId AND client.deletedAt IS NULL', { tenantId });

        // Search (name, email, phone)
        if (filters.search) {
            // Check for SQL injection
            if (detectSqlInjection(filters.search)) {
                throw new ForbiddenException('Invalid search query');
            }

            query.andWhere(
                '(client.firstName ILIKE :search OR ' +
                'client.lastName ILIKE :search OR ' +
                'client.email ILIKE :search OR ' +
                'client.phone ILIKE :search OR ' +
                'client.companyName ILIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        // Filter by type
        if (filters.type) {
            query.andWhere('client.type = :type', { type: filters.type });
        }

        // Filter by status
        if (filters.status) {
            query.andWhere('client.status = :status', { status: filters.status });
        }

        // Filter by assigned user
        if (filters.assignedUserId) {
            query.andWhere('client.assignedUserId = :assignedUserId', {
                assignedUserId: filters.assignedUserId,
            });
        }

        // Filter by city
        if (filters.city) {
            query.andWhere('client.city = :city', { city: filters.city });
        }

        // Filter by region
        if (filters.region) {
            query.andWhere('client.region = :region', { region: filters.region });
        }

        // Filter by date range
        if (filters.createdAtFrom) {
            query.andWhere('client.createdAt >= :createdAtFrom', {
                createdAtFrom: new Date(filters.createdAtFrom),
            });
        }

        if (filters.createdAtTo) {
            query.andWhere('client.createdAt <= :createdAtTo', {
                createdAtTo: new Date(filters.createdAtTo),
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
            limit,
        };
    }

    /**
     * Get client by ID
     */
    async findById(tenantId: string, id: string): Promise<Client> {
        const client = await this.clientRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: IsNull(),
            },
            relations: ['assignedUser', 'cases'],
        });

        if (!client) {
            throw new NotFoundException('Клієнта не знайдено');
        }

        return client;
    }

    /**
     * Create new client
     */
    async create(tenantId: string, userId: string, dto: CreateClientDto): Promise<Client> {
        // Validate EDRPOU if provided
        if (dto.edrpou && !validateEdrpou(dto.edrpou)) {
            throw new ForbiddenException('Невірний формат ЄДРПОУ');
        }

        // Validate INN if provided
        if (dto.inn && !validateTaxNumber(dto.inn)) {
            throw new ForbiddenException('Невірний формат ІПН');
        }

        const client = this.clientRepository.create({
            tenantId,
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });

        return this.clientRepository.save(client);
    }

    /**
     * Update existing client
     */
    async update(
        tenantId: string,
        id: string,
        userId: string,
        dto: UpdateClientDto
    ): Promise<Client> {
        const client = await this.findById(tenantId, id);

        // Validate EDRPOU if provided
        if (dto.edrpou && !validateEdrpou(dto.edrpou)) {
            throw new ForbiddenException('Невірний формат ЄДРПОУ');
        }

        // Validate INN if provided
        if (dto.inn && !validateTaxNumber(dto.inn)) {
            throw new ForbiddenException('Невірний формат ІПН');
        }

        Object.assign(client, dto, {
            updatedBy: userId,
        });

        return this.clientRepository.save(client);
    }

    /**
     * Delete client (soft delete)
     */
    async delete(tenantId: string, id: string, userId: string): Promise<void> {
        const client = await this.findById(tenantId, id);

        // Update instead of actual delete
        await this.clientRepository.update(
            { id, tenantId },
            {
                deletedAt: new Date(),
                updatedBy: userId,
            }
        );
    }

    /**
     * Restore deleted client
     */
    async restore(tenantId: string, id: string, userId: string): Promise<Client> {
        await this.clientRepository.update(
            { id, tenantId },
            {
                deletedAt: undefined,
                updatedBy: userId,
            }
        );

        return this.findById(tenantId, id);
    }

    /**
     * Bulk import clients
     */
    async bulkImport(
        tenantId: string,
        userId: string,
        dtos: CreateClientDto[]
    ): Promise<{ success: number; failed: number; errors: any[] }> {
        const results = {
            success: 0,
            failed: 0,
            errors: [] as any[],
        };

        for (const dto of dtos) {
            try {
                await this.create(tenantId, userId, dto);
                results.success++;
            } catch (error: unknown) {
                results.failed++;
                results.errors.push({
                    client: dto,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }

        return results;
    }

    /**
     * Get client statistics
     */
    async getStatistics(tenantId: string): Promise<{
        total: number;
        active: number;
        inactive: number;
        individuals: number;
        legalEntities: number;
    }> {
        const [total] = await this.clientRepository
            .createQueryBuilder('client')
            .select('COUNT(*)')
            .where('client.tenantId = :tenantId AND client.deletedAt IS NULL', { tenantId })
            .getRawMany();

        const [active] = await this.clientRepository
            .createQueryBuilder('client')
            .select('COUNT(*)')
            .where('client.tenantId = :tenantId AND client.status = :status AND client.deletedAt IS NULL', {
                tenantId,
                status: 'active',
            })
            .getRawMany();

        const [inactive] = await this.clientRepository
            .createQueryBuilder('client')
            .select('COUNT(*)')
            .where('client.tenantId = :tenantId AND client.status = :status AND client.deletedAt IS NULL', {
                tenantId,
                status: 'inactive',
            })
            .getRawMany();

        const [individuals] = await this.clientRepository
            .createQueryBuilder('client')
            .select('COUNT(*)')
            .where('client.tenantId = :tenantId AND client.type = :type AND client.deletedAt IS NULL', {
                tenantId,
                type: 'individual',
            })
            .getRawMany();

        const [legalEntities] = await this.clientRepository
            .createQueryBuilder('client')
            .select('COUNT(*)')
            .where('client.tenantId = :tenantId AND client.type = :type AND client.deletedAt IS NULL', {
                tenantId,
                type: 'legal_entity',
            })
            .getRawMany();

        return {
            total: parseInt(total[0].count),
            active: parseInt(active[0].count),
            inactive: parseInt(inactive[0].count),
            individuals: parseInt(individuals[0].count),
            legalEntities: parseInt(legalEntities[0].count),
        };
    }
}
