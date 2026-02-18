import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';
import { User } from './User.entity';
import { Organization } from './Organization.entity';
import {
    NotificationType,
    NotificationStatus,
    NotificationPriority,
    NotificationChannel,
} from './enums/notification-types.enum';

/**
 * Notification Entity
 */
@Entity('notifications')
@Index('idx_notifications_tenant_id', ['tenantId'])
@Index('idx_notifications_user_id', ['userId'])
@Index('idx_notifications_status', ['status'])
@Index('idx_notifications_type', ['type'])
@Index('idx_notifications_created_at', ['createdAt'])
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    // User Reference
    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId: string;

    @Column({ name: 'device_id', type: 'uuid', nullable: true })
    deviceId: string;

    @Column({ name: 'platform', type: 'varchar', length: 50, nullable: true })
    platform: string; // 'web' | 'mobile' | 'in_app' | 'desktop'

    @Column({ name: 'user_email', type: 'varchar', length: 255, nullable: true })
    userEmail: string;

    @Column({ name: 'user_phone', type: 'varchar', length: 20, nullable: true })
    userPhone: string;

    // Notification Details
    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
    })
    status: NotificationStatus;

    @Column({
        type: 'enum',
        enum: NotificationPriority,
        default: NotificationPriority.NORMAL
    })
    priority: NotificationPriority;

    @Column({ type: 'enum', enum: NotificationChannel, default: NotificationChannel.EMAIL })
    channel: NotificationChannel;

    @Column({ type: 'varchar', length: 500 })
    title: string;

    @Column({ type: 'text' })
    body: string;

    @Column({ type: 'text', nullable: true })
    data: Record<string, any>;

    // Template Reference (for email)
    @Column({ name: 'template_id', type: 'uuid', nullable: true })
    templateId: string;

    // Email-specific
    @Column({ name: 'from_email', type: 'varchar', length: 255, nullable: true })
    fromEmail: string;

    // SMS-specific
    @Column({ name: 'to_phone', type: 'varchar', length: 20, nullable: true })
    toPhone: string;

    // Tracking
    @Column({ name: 'device_token', type: 'varchar', length: 500, nullable: true })
    deviceToken: string;

    @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
    readAt: Date;

    @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
    deliveredAt: Date;

    @Column({ name: 'opened_at', type: 'timestamptz', nullable: true })
    openedAt: Date;

    @Column({ name: 'clicked_at', type: 'timestamptz', nullable: true })
    clickedAt: Date;

    @Column({ name: 'failed_at', type: 'timestamptz', nullable: true })
    failedAt: Date;

    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage: string;

    // Soft Delete
    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
    deletedAt: Date;

    // Timestamps
    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @Column({ name: 'created_by', type: 'uuid', nullable: true })
    createdBy: string;

    @Column({ name: 'updated_by', type: 'uuid', nullable: true })
    updatedBy: string;

    // Relations
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'tenant_id' })
    organization: Organization;
}
