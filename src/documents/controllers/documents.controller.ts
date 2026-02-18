import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    HttpCode,
    HttpStatus,
Req, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DocumentService } from '../services/document.service';
import { UploadDocumentDto, UpdateDocumentDto, DocumentFiltersDto, BulkUploadDocumentsDto, SignDocumentDto, GenerateSignedUrlDto } from '../dto/document.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { TenantGuard, RbacGuard } from '../../auth/guards';
import { Audit } from '../../auth/services/audit.service';

/**
 * Documents Controller
 */
@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class DocumentsController {
    constructor(private readonly documentService: DocumentService) {}

    @Get()
    @ApiOperation({ summary: 'Get all documents' })
    @ApiResponse({ status: 200, description: 'Documents retrieved' })
    async findAll(
        @Query() filters: DocumentFiltersDto,
        @Req() req: any
    ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
        const tenantId = req.user?.tenant_id;
        return this.documentService.findAll(tenantId, filters);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get document statistics' })
    @ApiResponse({ status: 200, description: 'Statistics retrieved' })
    async getStatistics(@Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        return this.documentService.getStatistics(tenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get document by ID' })
    @ApiResponse({ status: 200, description: 'Document retrieved' })
    async findById(@Param('id') id: string, @Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        return this.documentService.findById(tenantId, id);
    }

    @Post('upload')
    @UseGuards(RbacGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload document' })
    @ApiResponse({ status: 201, description: 'Document uploaded' })
    @Audit('create')
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadDocumentDto,
        @Req() req: any
    ): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.documentService.upload(tenantId, userId, file, dto);
    }

    @Post('bulk-upload')
    @UseGuards(RbacGuard)
    @UseInterceptors(FileInterceptor('files'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Bulk upload documents' })
    @ApiResponse({ status: 201, description: 'Documents uploaded' })
    async bulkUpload(
        @UploadedFile() files: Express.Multer.File[],
        @Body() dto: BulkUploadDocumentsDto,
        @Req() req: any
    ): Promise<{ success: number; failed: number; documents: any[] }> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.documentService.bulkUpload(tenantId, userId, files, dto.documents);
    }

    @Put(':id')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Update document metadata' })
    @ApiResponse({ status: 200, description: 'Document updated' })
    @Audit('update')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateDocumentDto,
        @Req() req: any
    ): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.documentService.update(tenantId, id, userId, dto);
    }

    @Post(':id/sign')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Sign document' })
    @ApiResponse({ status: 200, description: 'Document signed' })
    @Audit('update')
    async sign(
        @Param('id') id: string,
        @Body() dto: SignDocumentDto,
        @Req() req: any
    ): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.documentService.sign(tenantId, id, userId, dto);
    }

    @Post(':id/signed-url')
    @ApiOperation({ summary: 'Generate time-limited signed URL' })
    @ApiResponse({ status: 200, description: 'Signed URL generated' })
    async generateSignedUrl(
        @Param('id') id: string,
        @Body() dto: GenerateSignedUrlDto,
        @Req() req: any
    ): Promise<{ url: string; expiresAt: Date }> {
        const tenantId = req.user?.tenant_id;
        return this.documentService.generateSignedUrl(tenantId, id, dto);
    }

    @Delete(':id')
    @UseGuards(RbacGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete document' })
    @ApiResponse({ status: 204, description: 'Document deleted' })
    @Audit('delete')
    async delete(@Param('id') id: string, @Req() req: any): Promise<void> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.documentService.delete(tenantId, id, userId);
    }
}
