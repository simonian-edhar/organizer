import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
Req, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { PricelistService } from '../services/pricelist.service';
import {
    CreatePricelistDto,
    UpdatePricelistDto,
    CreatePricelistItemDto,
    UpdatePricelistItemDto,
    PricelistFiltersDto,
} from '../dto/pricelist.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { TenantGuard, RbacGuard } from '../../auth/guards';
import { Audit } from '../../auth/services/audit.service';

/**
 * Pricelists Controller
 */
@ApiTags('Pricelists')
@Controller('pricelists')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class PricelistsController {
    constructor(private readonly pricelistService: PricelistService) {}

    @Get()
    @ApiOperation({ summary: 'Get all pricelists' })
    @ApiResponse({ status: 200, description: 'Pricelists retrieved' })
    async findAll(
        @Query() filters: PricelistFiltersDto,
        @Req() req: any
    ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
        const tenantId = req.user?.tenant_id;
        return this.pricelistService.findAll(tenantId, filters);
    }

    @Get('default')
    @ApiOperation({ summary: 'Get default pricelist' })
    @ApiResponse({ status: 200, description: 'Default pricelist retrieved' })
    async getDefault(@Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        return this.pricelistService.getDefaultPricelist(tenantId);
    }

    @Get('items')
    @ApiOperation({ summary: 'Get items by category' })
    @ApiResponse({ status: 200, description: 'Items retrieved' })
    async getItemsByCategory(
        @Query('category') category: string,
        @Req() req: any
    ): Promise<any[]> {
        const tenantId = req.user?.tenant_id;
        return this.pricelistService.getItemsByCategory(tenantId, category);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get pricelist by ID' })
    @ApiResponse({ status: 200, description: 'Pricelist retrieved' })
    async findById(@Param('id') id: string, @Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        return this.pricelistService.findById(tenantId, id);
    }

    @Post()
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Create new pricelist' })
    @ApiResponse({ status: 201, description: 'Pricelist created' })
    @Audit('create')
    async create(@Body() dto: CreatePricelistDto, @Req() req: any): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.pricelistService.create(tenantId, userId, dto);
    }

    @Put(':id')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Update pricelist' })
    @ApiResponse({ status: 200, description: 'Pricelist updated' })
    @Audit('update')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdatePricelistDto,
        @Req() req: any
    ): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.pricelistService.update(tenantId, id, userId, dto);
    }

    @Delete(':id')
    @UseGuards(RbacGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete pricelist' })
    @ApiResponse({ status: 204, description: 'Pricelist deleted' })
    @Audit('delete')
    async delete(@Param('id') id: string, @Req() req: any): Promise<void> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.pricelistService.delete(tenantId, id, userId);
    }

    @Post(':id/items')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Add item to pricelist' })
    @ApiResponse({ status: 201, description: 'Item added' })
    @Audit('create')
    async addItem(
        @Param('id') id: string,
        @Body() dto: CreatePricelistItemDto,
        @Req() req: any
    ): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.pricelistService.addItem(tenantId, userId, id, dto);
    }

    @Put('items/:itemId')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Update pricelist item' })
    @ApiResponse({ status: 200, description: 'Item updated' })
    @Audit('update')
    async updateItem(
        @Param('itemId') itemId: string,
        @Body() dto: UpdatePricelistItemDto,
        @Req() req: any
    ): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.pricelistService.updateItem(tenantId, itemId, userId, dto);
    }

    @Delete('items/:itemId')
    @UseGuards(RbacGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete pricelist item' })
    @ApiResponse({ status: 204, description: 'Item deleted' })
    @Audit('delete')
    async deleteItem(@Param('itemId') itemId: string, @Req() req: any): Promise<void> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;
        return this.pricelistService.deleteItem(tenantId, itemId, userId);
    }

    @Post(':id/duplicate')
    @UseGuards(RbacGuard)
    @ApiOperation({ summary: 'Duplicate pricelist' })
    @ApiResponse({ status: 201, description: 'Pricelist duplicated' })
    @Audit('create')
    async duplicate(
        @Param('id') id: string,
        @Req() req: any
    ): Promise<any> {
        const tenantId = req.user?.tenant_id;
        const userId = req.user?.user_id;

        const original = await this.pricelistService.findById(tenantId, id);

        const duplicated = await this.pricelistService.create(tenantId, userId, {
            name: `${original.name} (Копія)`,
            description: original.description,
            type: original.type,
            status: 'active',
        });

        // Copy items
        for (const item of original.items) {
            await this.pricelistService.addItem(tenantId, userId, duplicated.id, {
                name: item.name,
                code: item.code,
                category: item.category,
                unitType: item.unitType,
                basePrice: item.basePrice,
                description: item.description,
            });
        }

        return duplicated;
    }
}
