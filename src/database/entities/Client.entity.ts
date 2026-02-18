import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UserRole } from './enums/subscription.enum';
import type { Case } from './Case.entity';
import type { User } from './User.entity';

/**
 * Client Types
 */
export type ClientType = 'individual' | 'legal_entity';

export type ClientStatus = 'active' | 'inactive' | 'blocked';

/**
 * Client Entity
 * Represents individual or legal entity clients
 */
@Entity('clients')
@Index('idx_clients_tenant_id', ['tenantId'])
@Index('idx_clients_status', ['status'])
@Index('idx_clients_type', ['type'])
@Index('idx_clients_name', ['firstName', 'lastName'])
export class Client {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    // Client Type
    @Column({
        type: 'varchar',
    })
    type: ClientType;

    // Personal Information
    @Column({ type: 'varchar', length: 100, nullable: true })
    firstName: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    lastName: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    patronymic: string;

    // Legal Entity Information (if type === 'legal_entity')
    @Column({ name: 'company_name', type: 'varchar', length: 255, nullable: true })
    companyName: string;

    @Column({ name: 'edrpou', type: 'varchar', length: 10, nullable: true })
    edrpou: string;

    @Column({ name: 'inn', type: 'varchar', length: 12, nullable: true })
    inn: string;

    // Contact Information
    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    secondaryPhone: string;

    // Address
    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    region: string;

    @Column({ name: 'postal_code', type: 'varchar', length: 10, nullable: true })
    postalCode: string;

    @Column({ type: 'varchar', length: 2, default: 'UA' })
    country: string;

    // Client Status
    @Column({
        type: 'varchar',
        default: 'active'
    })
    status: ClientStatus;

    @Column({ type: 'varchar', length: 20, nullable: true })
    source: string; // Where did the client come from?

    @Column({ name: 'assigned_user_id', type: 'uuid', nullable: true })
    assignedUserId: string;

    // Additional Information
    @Column({ name: 'passport_number', type: 'varchar', length: 20, nullable: true })
    passportNumber: string;

    @Column({ name: 'passport_date', type: 'date', nullable: true })
    passportDate: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    // Metadata for flexible fields
    @Column({ type: 'json' })
    metadata: Record<string, any>;

    // Soft Delete
    @DeleteDateColumn({ name: 'deleted_at', type: 'datetime' })
    deletedAt: Date;

    // Timestamps
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;

    @Column({ name: 'created_by', type: 'uuid', nullable: true })
    createdBy: string;

    @Column({ name: 'updated_by', type: 'uuid', nullable: true })
    updatedBy: string;

    // Relations
    @ManyToOne(() => require('./User.entity').User)
    @JoinColumn({ name: 'assigned_user_id' })
    assignedUser: User;

    @OneToMany(() => require('./Case.entity').Case, (caseEntity: Case) => caseEntity.client)
    cases: Case[];
}
