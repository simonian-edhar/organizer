import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesController } from './controllers/cases.controller';
import { CaseService } from './services/case.service';
import { Case } from '../database/entities/Case.entity';

/**
 * Cases Module
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([Case]),
    ],
    controllers: [CasesController],
    providers: [CaseService],
    exports: [CaseService],
})
export class CasesModule {}
