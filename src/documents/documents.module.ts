import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsController } from './controllers/documents.controller';
import { DocumentService } from './services/document.service';
import { Document } from '../database/entities/Document.entity';
import { FileStorageModule } from '../file-storage/file-storage.module';

/**
 * Documents Module
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([Document]),
        MulterModule.register({
            dest: './uploads',
            limits: {
                fileSize: 50 * 1024 * 1024, // 50 MB
            },
        }),
        FileStorageModule,
    ],
    controllers: [DocumentsController],
    providers: [DocumentService],
    exports: [DocumentService],
})
export class DocumentsModule {}
