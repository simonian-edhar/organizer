import { IsEnum, IsString, IsOptional, IsDateString, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../../database/entities/Event.entity';

/**
 * Create Event DTO
 */
export class CreateEventDto {
    @IsOptional()
    @IsString()
    caseId?: string;

    @IsEnum(['hearing', 'deadline', 'meeting', 'court_sitting', 'other'])
    type: EventType;

    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsDateString()
    eventDate: string;

    @IsOptional()
    @IsString()
    eventTime?: string;

    @IsOptional()
    @Type(() => Number)
    durationMinutes?: number;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    courtRoom?: string;

    @IsOptional()
    @IsString()
    judgeName?: string;

    @IsOptional()
    participants?: Record<string, any>;

    @IsOptional()
    @Type(() => Number)
    reminderDaysBefore?: number;
}

/**
 * Update Event DTO
 */
export class UpdateEventDto {
    @IsOptional()
    @IsEnum(['hearing', 'deadline', 'meeting', 'court_sitting', 'other'])
    type?: EventType;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    eventDate?: string;

    @IsOptional()
    @IsString()
    eventTime?: string;

    @IsOptional()
    @Type(() => Number)
    durationMinutes?: number;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    courtRoom?: string;

    @IsOptional()
    @IsString()
    judgeName?: string;

    @IsOptional()
    @IsEnum(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'])
    status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';

    @IsOptional()
    @IsString()
    notes?: string;
}

/**
 * Event Filters DTO
 */
export class EventFiltersDto {
    @IsOptional()
    @IsString()
    caseId?: string;

    @IsOptional()
    @IsEnum(['hearing', 'deadline', 'meeting', 'court_sitting', 'other'])
    type?: EventType;

    @IsOptional()
    @IsEnum(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'])
    status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';

    @IsOptional()
    @IsDateString()
    eventDateFrom?: string;

    @IsOptional()
    @IsDateString()
    eventDateTo?: string;

    @IsOptional()
    @IsString()
    search?: string;

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
