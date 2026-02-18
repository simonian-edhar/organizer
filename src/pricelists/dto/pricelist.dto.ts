import { IsEnum, IsString, IsOptional, IsNumber, IsDate, IsBoolean, Min, Max, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { PricelistType, PricelistStatus } from '../../database/entities/Pricelist.entity';

/**
 * Create Pricelist DTO
 */
export class CreatePricelistDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(['general', 'consultation', 'court', 'document', 'other'])
    type: PricelistType;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;

    @IsOptional()
    @IsEnum(['up', 'down', 'none'])
    roundingRule?: 'up' | 'down' | 'none';

    @IsOptional()
    @IsNumber()
    roundingPrecision?: number;

    @IsOptional()
    @IsNumber()
    vatRate?: number;

    @IsOptional()
    @IsBoolean()
    vatIncluded?: boolean;

    @IsOptional()
    discountEnabled?: boolean;

    @IsOptional()
    @IsEnum(['percentage', 'fixed'])
    discountType?: 'percentage' | 'fixed';

    @IsOptional()
    @IsNumber()
    discountValue?: number;
}

/**
 * Create PricelistItem DTO
 */
export class CreatePricelistItemDto {
    @IsString()
    name: string;

    @IsString()
    code: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    category: string;

    @IsEnum(['hourly', 'fixed', 'piecewise'])
    unitType: 'hourly' | 'fixed' | 'piecewise';

    @IsNumber()
    basePrice: number;

    @IsOptional()
    @IsNumber()
    defaultDuration?: number;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsNumber()
    minQuantity?: number;
}

/**
 * Update Pricelist DTO
 */
export class UpdatePricelistDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(['active', 'inactive', 'archived'])
    status?: PricelistStatus;
}

/**
 * Update PricelistItem DTO
 */
export class UpdatePricelistItemDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsNumber()
    basePrice?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsNumber()
    displayOrder?: number;
}

/**
 * Pricelist Filters DTO
 */
export class PricelistFiltersDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(['general', 'consultation', 'court', 'document', 'other'])
    type?: PricelistType;

    @IsOptional()
    @IsEnum(['active', 'inactive', 'archived'])
    status?: PricelistStatus;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;

    @IsOptional()
    @IsString()
    category?: string;

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
}
