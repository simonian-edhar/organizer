import { IsEnum, IsString, IsOptional, IsUUID, IsDateString, IsNumber, Min, Max, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Case Types
 */
export type CaseType = 'civil' | 'criminal' | 'administrative' | 'economic' | 'family' | 'labor' | 'tax' | 'other';

/**
 * Case Priority
 */
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Case Status
 */
export type CaseStatus = 'draft' | 'active' | 'on_hold' | 'closed' | 'archived';

/**
 * Create Case DTO
 */
export class CreateCaseDto {
    @IsString()
    caseNumber: string;

    @IsEnum(['civil', 'criminal', 'administrative', 'economic', 'family', 'labor', 'tax', 'other'])
    caseType: CaseType;

    @IsUUID()
    clientId: string;

    @IsUUID()
    assignedLawyerId: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(['low', 'medium', 'high', 'urgent'])
    priority: CasePriority;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsDateString()
    deadlineDate?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    estimatedAmount?: number;

    @IsOptional()
    @IsString()
    courtName?: string;

    @IsOptional()
    @IsString()
    courtAddress?: string;

    @IsOptional()
    @IsString()
    judgeName?: string;

    @IsOptional()
    @IsString()
    internalNotes?: string;

    @IsOptional()
    @IsString()
    clientNotes?: string;

    @IsOptional()
    metadata?: Record<string, any>;
}

/**
 * Update Case DTO
 */
export class UpdateCaseDto {
    @IsOptional()
    @IsString()
    caseNumber?: string;

    @IsOptional()
    @IsEnum(['civil', 'criminal', 'administrative', 'economic', 'family', 'labor', 'tax', 'other'])
    caseType?: CaseType;

    @IsOptional()
    @IsUUID()
    assignedLawyerId?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(['low', 'medium', 'high', 'urgent'])
    priority?: CasePriority;

    @IsOptional()
    @IsEnum(['draft', 'active', 'on_hold', 'closed', 'archived'])
    status?: CaseStatus;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsDateString()
    nextHearingDate?: string;

    @IsOptional()
    @IsDateString()
    deadlineDate?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    estimatedAmount?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    paidAmount?: number;

    @IsOptional()
    @IsString()
    courtName?: string;

    @IsOptional()
    @IsString()
    courtAddress?: string;

    @IsOptional()
    @IsString()
    judgeName?: string;

    @IsOptional()
    @IsString()
    internalNotes?: string;

    @IsOptional()
    @IsString()
    clientNotes?: string;

    @IsOptional()
    metadata?: Record<string, any>;
}

/**
 * Case Filters DTO
 */
export class CaseFiltersDto {
    @IsOptional()
    @IsUUID()
    clientId?: string;

    @IsOptional()
    @IsUUID()
    assignedLawyerId?: string;

    @IsOptional()
    @IsEnum(['civil', 'criminal', 'administrative', 'economic', 'family', 'labor', 'tax', 'other'])
    caseType?: CaseType;

    @IsOptional()
    @IsEnum(['low', 'medium', 'high', 'urgent'])
    priority?: CasePriority;

    @IsOptional()
    @IsEnum(['draft', 'active', 'on_hold', 'closed', 'archived'])
    status?: CaseStatus;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsDateString()
    startDateFrom?: string;

    @IsOptional()
    @IsDateString()
    startDateTo?: string;

    @IsOptional()
    @IsDateString()
    deadlineFrom?: string;

    @IsOptional()
    @IsDateString()
    deadlineTo?: string;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @IsString()
    sortBy?: string;

    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC';
}

/**
 * Add Timeline Event DTO
 */
export class AddTimelineEventDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(['created', 'updated', 'status_change', 'document_added', 'event_added', 'note', 'payment', 'other'])
    eventType: 'created' | 'updated' | 'status_change' | 'document_added' | 'event_added' | 'note' | 'payment' | 'other';

    @IsOptional()
    metadata?: Record<string, any>;
}
