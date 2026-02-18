import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationsController } from './controllers/calculation.controller';
import { CalculationService } from './services/calculation.service';
import { Calculation, CalculationItem, PricelistItem } from '../database/entities';

/**
 * Calculations Module
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([Calculation, CalculationItem, PricelistItem]),
    ],
    controllers: [CalculationsController],
    providers: [CalculationService],
    exports: [CalculationService],
})
export class CalculationsModule {}
