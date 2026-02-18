import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, In } from 'typeorm';
import { Event } from '../../database/entities/Event.entity';
import { CreateEventDto, UpdateEventDto, EventFiltersDto } from '../dto/event.dto';
import { detectSqlInjection } from '../../common/utils/validation.util';

/**
 * Event Service
 */
@Injectable()
export class EventService {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
    ) {}

    /**
     * Get all events with filters
     */
    async findAll(
        tenantId: string,
        filters: EventFiltersDto = {}
    ): Promise<{ data: Event[]; total: number; page: number; limit: number }> {
        const query = this.eventRepository
            .createQueryBuilder('event')
            .where('event.tenantId = :tenantId AND event.deletedAt IS NULL', { tenantId });

        // Filter by case
        if (filters.caseId) {
            query.andWhere('event.caseId = :caseId', { caseId: filters.caseId });
        }

        // Filter by type
        if (filters.type) {
            query.andWhere('event.type = :type', { type: filters.type });
        }

        // Filter by status
        if (filters.status) {
            query.andWhere('event.status = :status', { status: filters.status });
        }

        // Filter by date range
        if (filters.eventDateFrom && filters.eventDateTo) {
            query.andWhere('event.eventDate BETWEEN :eventDateFrom AND :eventDateTo', {
                eventDateFrom: new Date(filters.eventDateFrom),
                eventDateTo: new Date(filters.eventDateTo),
            });
        } else if (filters.eventDateFrom) {
            query.andWhere('event.eventDate >= :eventDateFrom', {
                eventDateFrom: new Date(filters.eventDateFrom),
            });
        } else if (filters.eventDateTo) {
            query.andWhere('event.eventDate <= :eventDateTo', {
                eventDateTo: new Date(filters.eventDateTo),
            });
        }

        // Search
        if (filters.search) {
            if (detectSqlInjection(filters.search)) {
                throw new ForbiddenException('Invalid search query');
            }

            query.andWhere(
                '(event.title ILIKE :search OR ' +
                'event.description ILIKE :search OR ' +
                'event.location ILIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        // Sorting
        const sortBy = filters.sortBy || 'eventDate';
        const sortOrder = filters.sortOrder || 'ASC';
        query.orderBy(`event.${sortBy}`, sortOrder);

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        query.skip(skip).take(limit);

        // Include relations
        query.leftJoinAndSelect('event.case', 'case');
        query.leftJoinAndSelect('event.createdByUser', 'createdByUser');

        const [data, total] = await query.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
        };
    }

    /**
     * Get event by ID
     */
    async findById(tenantId: string, id: string): Promise<Event> {
        const event = await this.eventRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: IsNull(),
            },
            relations: ['case', 'createdByUser'],
        });

        if (!event) {
            throw new NotFoundException('Подію не знайдено');
        }

        return event;
    }

    /**
     * Create new event
     */
    async create(tenantId: string, userId: string, dto: CreateEventDto): Promise<Event> {
        const event = this.eventRepository.create({
            tenantId,
            ...dto,
            status: 'scheduled',
            reminderSent: false,
            reminderDaysBefore: dto.reminderDaysBefore || 1,
            createdBy: userId,
            updatedBy: userId,
        });

        const savedEvent = await this.eventRepository.save(event);

        // TODO: Schedule reminders (cron job or Bull queue)
        await this.scheduleReminders(savedEvent);

        return savedEvent;
    }

    /**
     * Update event
     */
    async update(
        tenantId: string,
        id: string,
        userId: string,
        dto: UpdateEventDto
    ): Promise<Event> {
        const event = await this.findById(tenantId, id);

        Object.assign(event, dto, {
            updatedBy: userId,
        });

        return this.eventRepository.save(event);
    }

    /**
     * Delete event (soft delete)
     */
    async delete(tenantId: string, id: string, userId: string): Promise<void> {
        const event = await this.findById(tenantId, id);

        await this.eventRepository.update(
            { id, tenantId },
            {
                deletedAt: new Date(),
                updatedBy: userId,
            }
        );
    }

    /**
     * Get upcoming events
     */
    async getUpcoming(tenantId: string, days: number = 30): Promise<Event[]> {
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        return this.eventRepository.find({
            where: {
                tenantId,
                eventDate: Between(now, futureDate),
                status: In(['scheduled', 'in_progress']),
                deletedAt: IsNull(),
            },
            order: {
                eventDate: 'ASC',
                eventTime: 'ASC',
            },
            relations: ['case'],
        });
    }

    /**
     * Get calendar events (for integration)
     */
    async getCalendarEvents(
        tenantId: string,
        startDate: Date,
        endDate: Date
    ): Promise<Event[]> {
        return this.eventRepository.find({
            where: {
                tenantId,
                eventDate: Between(startDate, endDate),
                deletedAt: IsNull(),
            },
            order: {
                eventDate: 'ASC',
                eventTime: 'ASC',
            },
            relations: ['case'],
        });
    }

    /**
     * Schedule reminders
     */
    private async scheduleReminders(event: Event): Promise<void> {
        // TODO: Implement with Bull queue or BullMQ
        // This would create jobs to send reminders before the event

        // Example:
        // await this.remindersQueue.add(
        //     'send-event-reminder',
        //     { eventId: event.id, tenantId: event.tenantId },
        //     {
        //         delay: (event.eventDate.getTime() - Date.now()) - (event.reminderDaysBefore * 24 * 60 * 60 * 1000),
        //     }
        // );
    }

    /**
     * Get event statistics
     */
    async getStatistics(tenantId: string): Promise<{
        total: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        upcoming: number;
    overdue: number;
    }> {
        const now = new Date();

        const [total] = await this.eventRepository
            .createQueryBuilder('event')
            .select('COUNT(*)')
            .where('event.tenantId = :tenantId AND event.deletedAt IS NULL', { tenantId })
            .getRawMany();

        const [upcoming] = await this.eventRepository
            .createQueryBuilder('event')
            .select('COUNT(*)')
            .where(
                'event.tenantId = :tenantId AND event.eventDate >= :now AND event.status IN (:statuses) AND event.deletedAt IS NULL',
                { tenantId, now, statuses: ['scheduled', 'in_progress'] }
            )
            .getRawMany();

        const [overdue] = await this.eventRepository
            .createQueryBuilder('event')
            .select('COUNT(*)')
            .where(
                'event.tenantId = :tenantId AND event.eventDate < :now AND event.status = :status AND event.deletedAt IS NULL',
                { tenantId, now, status: 'scheduled' }
            )
            .getRawMany();

        const byType = await this.eventRepository
            .createQueryBuilder('event')
            .select('event.type', 'COUNT(*) as count')
            .where('event.tenantId = :tenantId AND event.deletedAt IS NULL', { tenantId })
            .groupBy('event.type')
            .getRawMany();

        const byStatus = await this.eventRepository
            .createQueryBuilder('event')
            .select('event.status', 'COUNT(*) as count')
            .where('event.tenantId = :tenantId AND event.deletedAt IS NULL', { tenantId })
            .groupBy('event.status')
            .getRawMany();

        return {
            total: parseInt(total[0].count),
            upcoming: parseInt(upcoming[0].count),
            overdue: parseInt(overdue[0].count),
            byType: byType.reduce((acc, row) => {
                acc[row.type] = parseInt(row.count);
                return acc;
            }, {} as Record<string, number>),
            byStatus: byStatus.reduce((acc, row) => {
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {} as Record<string, number>),
        };
    }
}
