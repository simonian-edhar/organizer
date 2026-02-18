import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileStorageController } from './controllers/file-storage.controller';
import { FileStorageService } from './services/file-storage.service';
import { StorageProviderService } from './services/storage-provider.service';
import { S3StorageService } from './providers/s3-storage.service';
import { LocalStorageService } from './providers/local-storage.service';

/**
 * File Storage Module
 *
 * Provides unified file storage functionality supporting:
 * - S3/MinIO (production)
 * - Local filesystem (development)
 * - File upload/download/delete
 * - Signed URL generation
 * - File versioning
 * - Storage quotas
 */
@Module({
    imports: [ConfigModule],
    controllers: [FileStorageController],
    providers: [
        FileStorageService,
        StorageProviderService,
        {
            provide: 'StorageService',
            useFactory: (storageProviderService: StorageProviderService) => {
                return storageProviderService.getStorageService();
            },
            inject: [StorageProviderService],
        },
        S3StorageService,
        LocalStorageService,
    ],
    exports: [FileStorageService, StorageProviderService, 'StorageService'],
})
export class FileStorageModule {}
