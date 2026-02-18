"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EventService", {
    enumerable: true,
    get: function() {
        return EventService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _Evententity = require("../../database/entities/Event.entity");
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
let EventService = class EventService {
    /**
     * Get all events with filters
     */ async findAll(tenantId, filters = {}) {
        const query = this.eventRepository.createQueryBuilder('event').where('event.tenantId = :tenantId AND event.deletedAt IS NULL', {
            tenantId
        });
        // Filter by case
        if (filters.caseId) {
            query.andWhere('event.caseId = :caseId', {
                caseId: filters.caseId
            });
        }
        // Filter by type
        if (filters.type) {
            query.andWhere('event.type = :type', {
                type: filters.type
            });
        }
        // Filter by status
        if (filters.status) {
            query.andWhere('event.status = :status', {
                status: filters.status
            });
        }
        // Filter by date range
        if (filters.eventDateFrom && filters.eventDateTo) {
            query.andWhere('event.eventDate BETWEEN :eventDateFrom AND :eventDateTo', {
                eventDateFrom: new Date(filters.eventDateFrom),
                eventDateTo: new Date(filters.eventDateTo)
            });
        } else if (filters.eventDateFrom) {
            query.andWhere('event.eventDate >= :eventDateFrom', {
                eventDateFrom: new Date(filters.eventDateFrom)
            });
        } else if (filters.eventDateTo) {
            query.andWhere('event.eventDate <= :eventDateTo', {
                eventDateTo: new Date(filters.eventDateTo)
            });
        }
        // Search
        if (filters.search) {
            if ((0, _validationutil.detectSqlInjection)(filters.search)) {
                throw new _common.ForbiddenException('Invalid search query');
            }
            query.andWhere('(event.title ILIKE :search OR ' + 'event.description ILIKE :search OR ' + 'event.location ILIKE :search)', {
                search: `%${filters.search}%`
            });
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
            limit
        };
    }
    /**
     * Get event by ID
     */ async findById(tenantId, id) {
        const event = await this.eventRepository.findOne({
            where: {
                id,
                tenantId,
                deletedAt: null
            },
            relations: [
                'case',
                'createdByUser'
            ]
        });
        if (!event) {
            throw new _common.NotFoundException('Подію не знайдено');
        }
        return event;
    }
    /**
     * Create new event
     */ async create(tenantId, userId, dto) {
        const event = this.eventRepository.create({
            tenantId,
            ...dto,
            status: 'scheduled',
            reminderSent: false,
            reminderDaysBefore: dto.reminderDaysBefore || 1,
            createdBy: userId,
            updatedBy: userId
        });
        const savedEvent = await this.eventRepository.save(event);
        // TODO: Schedule reminders (cron job or Bull queue)
        await this.scheduleReminders(savedEvent);
        return savedEvent;
    }
    /**
     * Update event
     */ async update(tenantId, id, userId, dto) {
        const event = await this.findById(tenantId, id);
        Object.assign(event, dto, {
            updatedBy: userId
        });
        return this.eventRepository.save(event);
    }
    /**
     * Delete event (soft delete)
     */ async delete(tenantId, id, userId) {
        const event = await this.findById(tenantId, id);
        await this.eventRepository.update({
            id,
            tenantId
        }, {
            deletedAt: new Date(),
            updatedBy: userId
        });
    }
    /**
     * Get upcoming events
     */ async getUpcoming(tenantId, days = 30) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        return this.eventRepository.find({
            where: {
                tenantId,
                eventDate: (0, _typeorm1.Between)(now, futureDate),
                status: (0, _typeorm1.In)([
                    'scheduled',
                    'in_progress'
                ]),
                deletedAt: null
            },
            order: {
                eventDate: 'ASC',
                eventTime: 'ASC'
            },
            relations: [
                'case'
            ]
        });
    }
    /**
     * Get calendar events (for integration)
     */ async getCalendarEvents(tenantId, startDate, endDate) {
        return this.eventRepository.find({
            where: {
                tenantId,
                eventDate: (0, _typeorm1.Between)(startDate, endDate),
                deletedAt: null
            },
            order: {
                eventDate: 'ASC',
                eventTime: 'ASC'
            },
            relations: [
                'case'
            ]
        });
    }
    /**
     * Schedule reminders
     */ async scheduleReminders(event) {
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
     */ async getStatistics(tenantId) {
        const now = new Date();
        const [total] = await this.eventRepository.createQueryBuilder('event').select('COUNT(*)').where('event.tenantId = :tenantId AND event.deletedAt IS NULL', {
            tenantId
        }).getRawMany();
        const [upcoming] = await this.eventRepository.createQueryBuilder('event').select('COUNT(*)').where('event.tenantId = :tenantId AND event.eventDate >= :now AND event.status IN (:statuses) AND event.deletedAt IS NULL', {
            tenantId,
            now,
            statuses: [
                'scheduled',
                'in_progress'
            ]
        }).getRawMany();
        const [overdue] = await this.eventRepository.createQueryBuilder('event').select('COUNT(*)').where('event.tenantId = :tenantId AND event.eventDate < :now AND event.status = :status AND event.deletedAt IS NULL', {
            tenantId,
            now,
            status: 'scheduled'
        }).getRawMany();
        const byType = await this.eventRepository.createQueryBuilder('event').select('event.type', 'COUNT(*) as count').where('event.tenantId = :tenantId AND event.deletedAt IS NULL', {
            tenantId
        }).groupBy('event.type').getRawMany();
        const byStatus = await this.eventRepository.createQueryBuilder('event').select('event.status', 'COUNT(*) as count').where('event.tenantId = :tenantId AND event.deletedAt IS NULL', {
            tenantId
        }).groupBy('event.status').getRawMany();
        return {
            total: parseInt(total[0].count),
            upcoming: parseInt(upcoming[0].count),
            overdue: parseInt(overdue[0].count),
            byType: byType.reduce((acc, row)=>{
                acc[row.type] = parseInt(row.count);
                return acc;
            }, {}),
            byStatus: byStatus.reduce((acc, row)=>{
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {})
        };
    }
    constructor(eventRepository){
        this.eventRepository = eventRepository;
    }
};
EventService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_Evententity.Event)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], EventService);

//# sourceMappingURL=event.service.js.map