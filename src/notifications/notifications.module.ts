import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';

/**
 * Notifications Module
 *
 * Provides notification functionality supporting:
 * - Email notifications
 * - In-app notifications
 * - SMS notifications (optional)
 * - Notification preferences
 */
@Module({
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationsModule {}
