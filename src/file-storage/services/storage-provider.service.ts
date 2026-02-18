import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageProvider, FileUploadOptions, FileUploadResult, FileDownloadOptions, FileDownloadResult, SignedUrlOptions, FileMetadata, FileVersion } from '../interfaces/file-storage.interfaces';
import { S3StorageService } from '../providers/s3-storage.service';
import { LocalStorageService } from '../providers/local-storage.service';

/**
 * Storage Provider Service
 *
 * Provides the appropriate storage provider based on configuration
 */
@Injectable()
export class StorageProviderService {
    private readonly logger = new Logger(StorageProviderService.name);
    private provider: IStorageProvider;

    constructor(
        private readonly configService: ConfigService,
        private readonly s3StorageService: S3StorageService,
        private readonly localStorageService: LocalStorageService,
    ) {
        this.provider = this.getStorageService();
        this.logger.log(`Storage provider initialized: ${this.getProviderType()}`);
    }

    /**
     * Get the storage provider type
     */
    getProviderType(): string {
        const provider = this.configService.get<string>('STORAGE_PROVIDER', 'local');
        return provider;
    }

    /**
     * Get the appropriate storage service
     */
    getStorageService(): IStorageProvider {
        const provider = this.configService.get<string>('STORAGE_PROVIDER', 'local');

        switch (provider) {
            case 's3':
                return this.s3StorageService;
            case 'local':
            default:
                return this.localStorageService;
        }
    }

    /**
     * Upload a file
     */
    async upload(options: FileUploadOptions): Promise<FileUploadResult> {
        return this.provider.upload(options);
    }

    /**
     * Download a file
     */
    async download(options: FileDownloadOptions): Promise<FileDownloadResult> {
        return this.provider.download(options);
    }

    /**
     * Delete a file
     */
    async delete(path: string): Promise<void> {
        return this.provider.delete(path);
    }

    /**
     * Check if a file exists
     */
    async exists(path: string): Promise<boolean> {
        return this.provider.exists(path);
    }

    /**
     * Get file metadata
     */
    async getMetadata(path: string): Promise<FileMetadata> {
        return this.provider.getMetadata(path);
    }

    /**
     * Generate a signed URL
     */
    async generateSignedUrl(options: SignedUrlOptions): Promise<string> {
        return this.provider.generateSignedUrl(options);
    }

    /**
     * List file versions
     */
    async listVersions(path: string): Promise<FileVersion[]> {
        return this.provider.listVersions(path);
    }

    /**
     * Copy a file
     */
    async copy(sourcePath: string, destinationPath: string): Promise<FileUploadResult> {
        return this.provider.copy(sourcePath, destinationPath);
    }

    /**
     * Move a file
     */
    async move(sourcePath: string, destinationPath: string): Promise<FileUploadResult> {
        return this.provider.move(sourcePath, destinationPath);
    }

    /**
     * Delete multiple files
     */
    async deleteMultiple(paths: string[]): Promise<void> {
        return this.provider.deleteMultiple(paths);
    }

    /**
     * Get storage usage for a prefix
     */
    async getStorageUsage(prefix: string): Promise<number> {
        return this.provider.getStorageUsage(prefix);
    }
}
