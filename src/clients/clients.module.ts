import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './controllers/clients.controller';
import { ClientService } from './services/client.service';
import { Client } from '../database/entities/Client.entity';

/**
 * Clients Module
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([Client]),
    ],
    controllers: [ClientsController],
    providers: [ClientService],
    exports: [ClientService],
})
export class ClientsModule {}
