"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NotificationService", {
    enumerable: true,
    get: function() {
        return NotificationService;
    }
});
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let NotificationService = class NotificationService {
    /**
     * Create notification
     */ async create(tenantId, userId, dto) {
        const notification = {
            tenantId,
            userId,
            type: dto.type,
            title: dto.title,
            body: dto.body,
            status: 'pending',
            priority: dto.priority || 'normal',
            data: dto.data || {}
        };
        let createdNotification;
        switch(dto.type){
            case 'email':
                createdNotification = await this.sendEmailNotification(notification, dto);
                break;
            case 'sms':
                createdNotification = await this.sendSmsNotification(notification, dto);
                break;
            case 'push':
                createdNotification = await this.sendPushNotification(notification, dto);
                break;
            case 'in_app':
                createdNotification = await this.sendInAppNotification(notification, dto);
                break;
            default:
                createdNotification = await this.notificationTemplateRepository.save(notification);
                break;
        }
        // TODO: Queue notification for delivery
        await this.queueNotification(createdNotification);
        return createdNotification;
    }
    /**
     * Get user notifications
     */ async getUserNotifications(tenantId, userId, filters = {}) {
        const query = this.notificationTemplateRepository.createQueryBuilder('notification').where('notification.tenantId = :tenantId AND notification.deletedAt IS NULL', {
            tenantId
        });
        if (filters.type) {
            query.andWhere('notification.type = :type', {
                type: filters.type
            });
        }
        if (filters.status) {
            query.andWhere('notification.status = :status', {
                status: filters.status
            });
        }
        if (filters.platform) {
            query.andWhere('notification.platform = :platform', {
                platform: filters.platform
            });
        }
        // Sorting
        query.orderBy('notification.createdAt', 'DESC');
        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);
        // Include relations
        query.leftJoinAndSelect('notification.user', 'user');
        query.leftJoinAndSelect('notification.userEmail', 'userEmail');
        const [data, total] = await query.getManyAndCount();
        return {
            data,
            total,
            page,
            limit
        };
    }
    /**
     * Mark notification as read
     */ async markAsRead(tenantId, userId, notificationId) {
        const notification = await this.notificationTemplateRepository.findOne({
            where: {
                id: notificationId,
                tenantId,
                userId,
                deletedAt: null
            }
        });
        if (!notification) {
            throw new _common.NotFoundException('Notification not found');
        }
        if (notification.userId !== userId) {
            throw new _common.ForbiddenException('You can only mark your own notifications as read');
        }
        notification.readAt = new Date();
        await this.notificationTemplateRepository.save(notification);
    }
    /**
     * Mark all notifications as read
     */ async markAllAsRead(tenantId, userId, filters = {}) {
        const query = this.notificationTemplateRepository.createQueryBuilder('notification').where('notification.tenantId = :tenantId AND notification.userId = :userId AND notification.deletedAt IS NULL', {
            tenantId,
            userId
        });
        if (filters.type) {
            query.andWhere('notification.type = :type', {
                type: filters.type
            });
        }
        if (filters.platform) {
            query.andWhere('notification.platform = :platform', {
                platform: filters.platform
            });
        }
        // Date range
        if (filters.beforeDate && filters.afterDate) {
            query.andWhere('notification.createdAt BETWEEN :beforeDate AND :afterDate', {
                beforeDate: new Date(filters.beforeDate),
                afterDate: new Date(filters.afterDate)
            });
        } else if (filters.beforeDate) {
            query.andWhere('notification.createdAt >= :beforeDate', {
                beforeDate: new Date(filters.beforeDate)
            });
        } else if (filters.afterDate) {
            query.andWhere('notification.createdAt <= :afterDate', {
                afterDate: new Date(filters.afterDate)
            });
        }
        // Sorting
        query.orderBy('notification.createdAt', 'DESC');
        // Pagination
        const limit = filters.limit || 100;
        const batchSize = filters.batch_size || 100;
        let markedCount = 0;
        while(true){
            const notifications = await query.where('notification.readAt IS NULL AND notification.deletedAt IS NULL').orderBy('notification.createdAt', 'DESC').limit(batchSize).getMany();
            if (notifications.length === 0) {
                break;
            }
            await this.notificationTemplateRepository.update({
                id: notifications.map((n)=>n.id)
            }, {
                readAt: new Date(),
                updatedBy: userId
            });
            markedCount += notifications.length;
        }
        return markedCount;
    }
    /**
     * Delete notification
     */ async delete(tenantId, userId, notificationId) {
        const notification = await this.notificationTemplateRepository.findOne({
            where: {
                id: notificationId,
                tenantId,
                userId
            }
        });
        if (!notification) {
            throw new _common.NotFoundException('Notification not found');
        }
        if (notification.userId !== userId) {
            throw new _common.ForbiddenException('You can only delete your own notifications');
        }
        // Soft delete
        await this.notificationTemplateRepository.update({
            id
        }, {
            deletedAt: new Date(),
            updatedBy: userId
        });
    }
    /**
     * Delete all notifications
     */ async deleteAll(tenantId, userId) {
        const result = await this.notificationTemplateRepository.update({
            tenant_id: tenantId,
            user_id: userId
        }, {
            deleted_at: new Date(),
            updated_by: userId
        });
        return result.affected;
    }
    /**
     * Get notification preferences
     */ async getPreferences(tenantId, userId) {
        const user = await this.userService.findById(tenantId, userId);
        return {
            email_enabled: true,
            sms_enabled: false,
            push_enabled: true,
            email_digest_enabled: true,
            sms_digest_enabled: true,
            push_digest_enabled: true,
            desktop_enabled: true,
            mobile_enabled: true,
            in_app_enabled: true
        };
    }
    /**
     * Update notification preferences
     */ async updatePreferences(tenantId, userId, preferences) {
        await this.userService.updatePreferences(tenantId, userId, preferences);
    }
    /**
     * Get unread count
     */ async getUnreadCount(tenantId, userId) {
        const count = await this.notificationTemplateRepository.count({
            where: {
                tenant_id: tenantId,
                user_id: userId,
                read_at: null,
                deleted_at: null
            }
        });
        return count;
    }
    /**
     * Send email notification
     */ async sendEmailNotification(notification, options = {}) {
        // TODO: Integrate with SendGrid/Mailgun/Resend
        const { data } = await this.emailService.send({
            to: options.to || notification.userEmail,
            from_name: options.from_name || 'LAW ORGANIZER',
            template_name: options.template_name,
            template_data: options.template_data || {
                user_name: notification.userFirstName || 'Користувач',
                user_email: notification.userEmail,
                action: notification.title,
                ...options.template_data
            }
        });
        return data;
    }
    /**
     * Send SMS notification
     */ async sendSmsNotification(notification, dto) {
        // TODO: Integrate with Twilio/Viber/SMSFly
        const { data } = await this.smsService.send({
            to: dto.userPhone,
            message: dto.body,
            type: 'authentication',
            priority: 'high',
            template_data: {
                code: dto.data?.verification_code,
                user_name: notification.userFirstName || 'Користувач',
                case_id: dto.data?.caseId,
                event_id: dto.data?.eventId
            }
        });
        return data;
    }
    /**
     * Send push notification
     */ async sendPushNotification(notification) {
        // TODO: Integrate with Firebase/APNS/OneSignal
        const { data } = await this.pushService.send({
            to: notification.deviceId,
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            platform: notification.platform || 'mobile'
        });
        return data;
    }
    /**
     * Send in-app notification
     */ async sendInAppNotification(notification) {
        // TODO: Integrate with React Native/Flutter
        const { data } = await this.inAppService.send({
            to: notification.userId,
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            notification_type: 'alert' | 'information',
            platform: 'in_app',
            priority: notification.priority || 'normal'
        });
        return data;
    }
    /**
     * Queue notification for delivery
     */ async queueNotification(notification) {
        // TODO: Implement with Bull/BullMQ
        // Send to Redis queue for async processing
        await this.notificationQueue.add({
            jobName: 'send-notification',
            data: {
                notificationId: notification.id,
                tenantId: notification.tenantId,
                userId: notification.userId,
                type: notification.type,
                title: notification.title,
                body: notification.body,
                data: notification.data || {},
                platform: notification.platform || 'web'
            },
            options: {
                attempts: 3,
                backoff: {
                    delay: 5000,
                    type: 'exponential',
                    delay: 30000
                }
            }
        });
    }
    /**
     * Mark notification as delivered
     */ async markAsDelivered(tenantId, notificationId, userId, dto) {
        const notification = await this.notificationTemplateRepository.findOne({
            where: {
                id: notificationId,
                tenantId,
                deletedAt: null
            }
        });
        if (!notification) {
            throw new _common.NotFoundException('Notification not found');
        }
        if (notification.userId !== userId) {
            throw new _common.ForbiddenException('You can only mark your own notifications as delivered');
        }
        notification.deliveredAt = new Date();
        notification.deliveredBy = userId;
        if (dto.platform) {
            notification.platform = dto.platform;
        }
        if (dto.device_info) {
            notification.metadata = {
                deviceInfo: dto.device_info,
                ipAddress: dto.ip_address,
                userAgent: dto.user_agent
            };
        }
        await this.notificationTemplateRepository.save(notification);
    // TODO: Send delivery confirmation to user
    // await this.emailService.send({
    //     to: notification.userEmail,
    //     from_name: 'LAW ORGANIZER',
    //     template_name: 'delivery_confirmation',
    //     template_data: {
    //         user_name: notification.userFirstName || 'Користувач',
    //         platform: dto.platform,
    //         device_name: dto.device_info?.device_name || 'Невідомий пристрій',
    //         notification_title: notification.title,
    //     },
    // });
    }
    /**
     * Mark notification as failed
     */ async markAsFailed(tenantId, notificationId, userId, error) {
        const notification = await this.notificationTemplateRepository.findOne({
            where: {
                id: notificationId,
                tenantId,
                deletedAt: null
            }
        });
        if (!notification) {
            throw new _common.NotFoundException('Notification not found');
        }
        if (notification.userId !== userId) {
            throw new _common.ForbiddenException('You can only mark your own notifications as failed');
        }
        notification.status = 'failed';
        notification.error_code = error.error_code;
        notification.error_message = error.error_message;
        if (error.platform) {
            notification.platform = error.platform;
        }
        notification.failedAt = new Date();
        notification.failedBy = userId;
        notification.metadata = {
            ipAddress: error.ip_address,
            userAgent: error.user_agent,
            deviceInfo: error.device_info,
            device_token: error.device_token
        };
        await this.notificationTemplateRepository.save(notification);
    // TODO: Send error notification to admin
    // await this.notificationService.sendErrorNotification({
    //     type: 'email',
    //     priority: 'high',
    //     title: 'Помилка повідомлення',
    //     body: `Не вдалося відправити повідомлення для "${notification.title}"`,
    // });
    }
    /**
     * Get notification statistics
     */ async getStatistics(tenantId) {
        const [total] = await this.notificationTemplateRepository.createQueryBuilder('notification').select('COUNT(*)').where('notification.tenant_id = :tenantId AND notification.deletedAt IS NULL', {
            tenantId
        }).getRawMany();
        const [byType] = await this.notificationTemplateRepository.createQueryBuilder('notification').select('notification.type', 'COUNT(*) as count').where('notification.tenant_id = :tenantId AND notification.deletedAt IS NULL', {
            tenantId
        }).groupBy('notification.type').getRawMany();
        const [byStatus] = await this.notificationTemplateRepository.createQueryBuilder('notification').select('notification.status', 'COUNT(*) as count').where('notification.tenant_id = :tenantId AND notification.deletedAt IS NULL', {
            tenantId
        }).groupBy('notification.status').getRawMany();
        const [byPlatform] = await this.notificationTemplateRepository.createQueryBuilder('notification').select('notification.platform', 'COUNT(*) as count').where('notification.tenant_id = :tenantId AND notification.deletedAt IS NULL', {
            tenantId
        }).groupBy('notification.platform').getRawMany();
        const [unreadCount] = await this.notificationTemplateRepository.createQueryBuilder('notification').select('COUNT(*) as count').where('notification.tenant_id = :tenantId AND notification.deletedAt IS NULL AND notification.readAt IS NULL', {
            tenantId
        }).getRawMany();
        return {
            total: parseInt(total[0].count),
            byType: byType.reduce((acc, row)=>{
                acc[row.type] = parseInt(row.count);
                return acc;
            }, {}),
            byStatus: byStatus.reduce((acc, row)=>{
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {}),
            byPlatform: byPlatform.reduce((acc, row)=>{
                acc[row.platform] = parseInt(row.count);
                return acc;
            }, {}),
            unread_count: parseInt(unreadCount[0].count)
        };
    }
    constructor(){}
};
NotificationService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], NotificationService);

//# sourceMappingURL=notification.service.js.map