import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SubscriptionPlan, SubscriptionStatus, SubscriptionProvider } from './enums/subscription.enum';
import { User } from './User.entity';
import { Subscription } from './Subscription.entity';

@Entity('organizations')
@Index('idx_organizations_name', ['name'])
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({
        type: 'varchar',
        default: 'sole_proprietor'
    })
    legalForm: 'sole_proprietor' | 'llc' | 'joint_stock' | 'partnership' | 'other';

    @Column({ type: 'varchar', length: 10, nullable: true })
    edrpou: string;

    @Column({ type: 'varchar', length: 12, nullable: true })
    taxNumber: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    region: string;

    @Column({ type: 'varchar', length: 2, default: 'UA' })
    country: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    website: string;

    // Subscription fields
    @Column({
        type: 'varchar',
        default: SubscriptionPlan.BASIC
    })
    subscriptionPlan: SubscriptionPlan;

    @Column({
        type: 'varchar',
        default: SubscriptionStatus.TRIALING
    })
    subscriptionStatus: SubscriptionStatus;

    @Column({ type: 'datetime', nullable: true })
    trialEndAt: Date;

    @Column({ type: 'datetime', nullable: true })
    currentPeriodEndAt: Date;

    @Column({ type: 'int', default: 1 })
    maxUsers: number;

    // Configuration
    @Column({ type: 'varchar', length: 255, nullable: true })
    customDomain: string;

    @Column({ type: 'boolean', default: false })
    mfaRequired: boolean;

    @Column({ type: 'boolean', default: false })
    ssoEnabled: boolean;

    @Column({ type: 'int', default: 90 })
    auditRetentionDays: number;

    // Status
    @Column({
        type: 'varchar',
        default: 'provisioning'
    })
    status: 'provisioning' | 'active' | 'suspended' | 'deleted';

    // Metadata
    @Column({ type: 'json' })
    settings: Record<string, any>;

    @Column({ type: 'json' })
    metadata: Record<string, any>;

    // Timestamps
    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'datetime' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'datetime' })
    deletedAt: Date;

    // Relations
    @OneToMany(() => User, user => user.organization)
    users: User[];

    @OneToMany(() => Subscription, subscription => subscription.organization)
    subscriptions: Subscription[];

    @OneToMany('AuditLog', 'organization')
    auditLogs: import('./AuditLog.entity').AuditLog[];
}
