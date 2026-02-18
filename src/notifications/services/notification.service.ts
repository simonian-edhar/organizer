import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
/**
 * Notification Service
 */
@Injectable()
export class NotificationService {
    constructor(
        // Services will be injected when properly implemented
    ) {}

    /**
     * Create notification
     */
    async create(
        tenantId: string,
        userId: string,
        dto: {
            type: 'email' | 'sms' | 'push' | 'in_app';
            title: string;
            body: string;
            data?: Record<string, any>;
            platform?: 'web' | 'mobile' | 'desktop';
            priority?: 'normal' | 'high' | 'urgent';
        }
    ): Promise<any> {
        const notification = {
            tenantId,
            userId,
            type: dto.type,
            title: dto.title,
            body: dto.body,
            status: 'pending',
            priority: dto.priority || 'normal',
            data: dto.data || {},
        };

        let createdNotification;

        switch (dto.type) {
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
     */
    async getUserNotifications(
        tenantId: string,
        userId: string,
        filters: {
            type?: string;
            status?: string;
            platform?: string;
            limit?: number;
            page?: number;
        } = {}
    ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
        const query = this.notificationTemplateRepository
            .createQueryBuilder('notification')
            .where('notification.tenantId = :tenantId AND notification.deletedAt IS NULL', { tenantId });

        if (filters.type) {
            query.andWhere('notification.type = :type', { type: filters.type });
        }

        if (filters.status) {
            query.andWhere('notification.status = :status', { status: filters.status });
        }

        if (filters.platform) {
            query.andWhere('notification.platform = :platform', { platform: filters.platform });
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
            limit,
        };
    }

    /**
     * Mark notification as read
     */
    async markAsRead(
        tenantId: string,
        userId: string,
        notificationId: string
    ): Promise<void> {
        const notification = await this.notificationTemplateRepository.findOne({
            where: {
                id: notificationId,
                tenantId,
                userId,
                deletedAt: null,
            },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        if (notification.userId !== userId) {
            throw new ForbiddenException('You can only mark your own notifications as read');
        }

        notification.readAt = new Date();

        await this.notificationTemplateRepository.save(notification);
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(
        tenantId: string,
        userId: string,
        filters: {
            type?: string;
        platform?: string;
        beforeDate?: string;
        afterDate?: string;
        limit?: number;
        batch_size?: number;
        } = {}
    ): Promise<number> {
        const query = this.notificationTemplateRepository
            .createQueryBuilder('notification')
            .where('notification.tenantId = :tenantId AND notification.userId = :userId AND notification.deletedAt IS NULL', {
                tenantId,
                userId,
            });

        if (filters.type) {
            query.andWhere('notification.type = :type', { type: filters.type });
        }

        if (filters.platform) {
            query.andWhere('notification.platform = :platform', { platform: filters.platform });
        }

        // Date range
        if (filters.beforeDate && filters.afterDate) {
            query.andWhere('notification.createdAt BETWEEN :beforeDate AND :afterDate', {
                beforeDate: new Date(filters.beforeDate),
                afterDate: new Date(filters.afterDate),
            });
        } else if (filters.beforeDate) {
            query.andWhere('notification.createdAt >= :beforeDate', {
                beforeDate: new Date(filters.beforeDate),
            });
        } else if (filters.afterDate) {
            query.andWhere('notification.createdAt <= :afterDate', {
                afterDate: new Date(filters.afterDate),
            });
        }

        // Sorting
        query.orderBy('notification.createdAt', 'DESC');

        // Pagination
        const limit = filters.limit || 100;
        const batchSize = filters.batch_size || 100;

        let markedCount = 0;

        while (true) {
            const notifications = await query
                .where('notification.readAt IS NULL AND notification.deletedAt IS NULL')
                .orderBy('notification.createdAt', 'DESC')
                .limit(batchSize)
                .getMany();

            if (notifications.length === 0) {
                break;
            }

            await this.notificationTemplateRepository.update(
                { id: notifications.map(n => n.id) },
                {
                    readAt: new Date(),
                    updatedBy: userId,
                }
            );

            markedCount += notifications.length;
        }

        return markedCount;
    }

    /**
     * Delete notification
     */
    async delete(tenantId: string, userId: string, notificationId: string): Promise<void> {
        const notification = await this.notificationTemplateRepository.findOne({
            where: {
                id: notificationId,
                tenantId,
                userId,
            },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        if (notification.userId !== userId) {
            throw new ForbiddenException('You can only delete your own notifications');
        }

        // Soft delete
        await this.notificationTemplateRepository.update(
            { id },
            {
                deletedAt: new Date(),
                updatedBy: userId,
            }
        );
    }

    /**
     * Delete all notifications
     */
    async deleteAll(tenantId: string, userId: string): Promise<number> {
        const result = await this.notificationTemplateRepository.update(
            {
                tenant_id: tenantId,
                user_id: userId,
            },
            {
                deleted_at: new Date(),
                updated_by: userId,
            }
        );

        return result.affected;
    }

    /**
     * Get notification preferences
     */
    async getPreferences(
        tenantId: string,
        userId: string
    ): Promise<{
        email_enabled: boolean;
        sms_enabled: boolean;
        push_enabled: boolean;
        email_digest_enabled: boolean;
        sms_digest_enabled: boolean;
        push_digest_enabled: boolean;
        desktop_enabled: boolean;
        mobile_enabled: boolean;
        in_app_enabled: boolean;
    }> {
        const user = await this.userService.findById(tenantId, userId);

        return {
            email_enabled: true, // TODO: from preferences
            sms_enabled: false, // TODO: from preferences
            push_enabled: true, // TODO: from preferences
            email_digest_enabled: true,
            sms_digest_enabled: true,
            push_digest_enabled: true,
            desktop_enabled: true,
            mobile_enabled: true,
            in_app_enabled: true,
        };
    }

    /**
     * Update notification preferences
     */
    async updatePreferences(
        tenantId: string,
        userId: string,
        preferences: {
            email_enabled?: boolean;
            sms_enabled?: boolean;
            push_enabled?: boolean;
            email_digest_enabled?: boolean;
            sms_digest_enabled?: boolean;
            push_digest_enabled?: boolean;
            desktop_enabled?: boolean;
            mobile_enabled?: boolean;
            in_app_enabled?: boolean;
            push_digest_enabled?: boolean;
        }
    ): Promise<void> {
        await this.userService.updatePreferences(tenantId, userId, preferences);
    }

    /**
     * Get unread count
     */
    async getUnreadCount(
        tenantId: string,
        userId: string
    ): Promise<number> {
        const count = await this.notificationTemplateRepository.count({
            where: {
                tenant_id: tenantId,
                user_id: userId,
                read_at: null,
                deleted_at: null,
            },
        });

        return count;
    }

    /**
     * Send email notification
     */
    private async sendEmailNotification(
        notification: any,
        options: {
            to?: string;
            from_name?: string;
            template_name: string;
            template_data?: Record<string, any>;
        } = {}
    ): Promise<any> {
        // TODO: Integrate with SendGrid/Mailgun/Resend
        const { data } = await this.emailService.send({
            to: options.to || notification.userEmail,
            from_name: options.from_name || 'LAW ORGANIZER',
            template_name: options.template_name,
            template_data: options.template_data || {
                user_name: notification.userFirstName || 'Користувач',
                user_email: notification.userEmail,
                action: notification.title,
                ...options.template_data,
            },
        });

        return data;
    }

    /**
     * Send SMS notification
     */
    private async sendSmsNotification(
        notification: any,
        dto: any
    ): Promise<any> {
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
        event_id: dto.data?.eventId,
        },
        });

        return data;
    }

    /**
     * Send push notification
     */
    private async sendPushNotification(
        notification: any
    ): Promise<any> {
        // TODO: Integrate with Firebase/APNS/OneSignal
        const { data } = await this.pushService.send({
            to: notification.deviceId,
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            platform: notification.platform || 'mobile', // Default to mobile
        });

        return data;
    }

    /**
     * Send in-app notification
     */
    private async sendInAppNotification(
        notification: any
    ): Promise<any> {
        // TODO: Integrate with React Native/Flutter
        const { data } = await this.inAppService.send({
            to: notification.userId,
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            notification_type: 'alert' | 'information',
            platform: 'in_app',
            priority: notification.priority || 'normal',
        });

        return data;
    }

    /**
     * Queue notification for delivery
     */
    private async queueNotification(notification: any): Promise<void> {
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
                platform: notification.platform || 'web', // Default to web
            },
            options: {
                attempts: 3,
                backoff: {
                    delay: 5000, // 5 seconds
                    type: 'exponential',
                    delay: 30000, // 30 seconds (max delay = 5 * 30 = 150s)
                },
            },
        });
    }

    /**
     * Mark notification as delivered
     */
    async markAsDelivered(
        tenantId: string,
        notificationId: string,
        userId: string,
        dto: {
            platform?: 'web' | 'mobile' | 'desktop';
            device_info?: Record<string, any>;
        ip_address?: string;
        user_agent?: string;
        device_token?: string;
    }
    ): Promise<void> {
        const notification = await this.notificationTemplateRepository.findOne({
            where: {
                id: notificationId,
                tenantId,
            deletedAt: null,
            },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        if (notification.userId !== userId) {
            throw new ForbiddenException('You can only mark your own notifications as delivered');
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
                userAgent: dto.user_agent,
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
     */
    async markAsFailed(
        tenantId: string,
        notificationId: string,
        userId: string,
        error: {
            error_code: string;
            error_message: string;
            platform?: 'web' | 'mobile' | 'desktop' | 'push' | 'in_app';
            ip_address?: string;
            user_agent?: string;
            device_token?: string;
            device_info?: Record<string, any>;
        }
    ): Promise<void> {
        const notification = await this.notificationTemplateRepository.findOne({
            where: {
                id: notificationId,
                tenantId,
                deletedAt: null,
            },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        if (notification.userId !== userId) {
            throw new ForbiddenException('You can only mark your own notifications as failed');
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
            device_token: error.device_token,
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
     */
    async getStatistics(tenantId: string): Promise<{
        total: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        byPlatform: Record<string, number>;
        unread_count: number;
    }> {
        const [total] = await this.notificationTemplateRepository
            .createQueryBuilder('notification')
            .select('COUNT(*)')
            .where('notification.tenant_id = :tenantId AND notification.deletedAt IS NULL', { tenantId })
            .getRawMany();

        const [byType] = await this.notificationTemplateRepository
            .createQueryBuilder('notification')
            .select('notification.type', 'COUNT(*) as count')
            .where('notification.tenant_id = :tenantId AND notification.deletedAt IS NULL', { tenantId })
            .groupBy('notification.type')
            .getRawMany();

        const [byStatus] = await this.notificationTemplateRepository
            .createQueryBuilder('notification')
            .select('notification.status', 'COUNT(*) as count')
            .where('notification.tenant_id = :tenantId AND notification.deletedAt IS NULL', { tenantId })
            .groupBy('notification.status')
            .getRawMany();

        const [byPlatform] = await this.notificationTemplateRepository
            .createQueryBuilder('notification')
            .select('notification.platform', 'COUNT(*) as count')
            .where('notification.tenant_id = :tenantId AND notification.deletedAt IS NULL', { tenantId })
            .groupBy('notification.platform')
            .getRawMany();

        const [unreadCount] = await this.notificationTemplateRepository
            .createQueryBuilder('notification')
            .select('COUNT(*) as count')
            .where('notification.tenant_id = :tenantId AND notification.deletedAt IS NULL AND notification.readAt IS NULL', { tenantId })
            .getRawMany();

        return {
            total: parseInt(total[0].count),
            byType: byType.reduce((acc, row) => {
                acc[row.type] = parseInt(row.count);
                return acc;
            }, {} as Record<string, number>),
            byStatus: byStatus.reduce((acc, row) => {
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {} as Record<string, number>),
            byPlatform: byPlatform.reduce((acc, row) => {
                acc[row.platform] = parseInt(row.count);
                return acc;
            }, {} as Record<string, number>),
            unread_count: parseInt(unreadCount[0].count),
        };
    }
}
