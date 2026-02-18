import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesController } from './controllers/invoices.controller';
import { InvoiceService } from './services/invoice.service';
import { Invoice } from '../database/entities/Invoice.entity';

/**
 * Invoices Module
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice]),
    ],
    controllers: [InvoicesController],
    providers: [InvoiceService],
    exports: [InvoiceService],
})
export class InvoicesModule {}
