import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    Request,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from '../services/billing.service';
import { StripeService } from '../services/stripe.service';
import { WayForPayService } from '../services/wayforpay.service';
import { CreateCheckoutSessionDto, CancelSubscriptionDto, ResumeSubscriptionDto } from '../dto/billing.dto';
import { JwtAuthGuard } from '../../auth/guards';

/**
 * Billing Controller
 */
@ApiTags('Billing')
@Controller('billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
    constructor(
        private readonly billingService: BillingService,
        private readonly stripeService: StripeService,
        private readonly wayForPayService: WayForPayService,
    ) {}

    @Post('checkout')
    @ApiOperation({ summary: 'Create checkout session' })
    @ApiResponse({ status: 200, description: 'Checkout session created' })
    async createCheckoutSession(
        @Body() dto: CreateCheckoutSessionDto,
        @Req() req: Request,
    ): Promise<{ checkoutUrl: string; sessionId: string }> {
        const tenantId = (req as any).user?.tenant_id;

        if (dto.provider === 'stripe') {
            return this.stripeService.createCheckoutSession(tenantId, dto);
        } else {
            return this.wayForPayService.createCheckoutSession(tenantId, dto);
        }
    }

    @Post('portal')
    @ApiOperation({ summary: 'Create customer portal session' })
    @ApiResponse({ status: 200, description: 'Portal session created' })
    async createPortalSession(
        @Body() body: { returnUrl: string },
        @Req() req: Request,
    ): Promise<{ url: string }> {
        const tenantId = (req as any).user?.tenant_id;
        return this.stripeService.createPortalSession(tenantId, body.returnUrl);
    }

    @Post('cancel')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Cancel subscription' })
    @ApiResponse({ status: 204, description: 'Subscription canceled' })
    async cancelSubscription(
        @Body() dto: CancelSubscriptionDto,
        @Req() req: Request,
    ): Promise<void> {
        const tenantId = (req as any).user?.tenant_id;
        await this.billingService.cancelSubscription(
            tenantId,
            dto.atPeriodEnd ?? true
        );
    }

    @Post('resume')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Resume subscription' })
    @ApiResponse({ status: 204, description: 'Subscription resumed' })
    async resumeSubscription(
        @Body() dto: ResumeSubscriptionDto,
        @Req() req: Request,
    ): Promise<void> {
        const tenantId = (req as any).user?.tenant_id;
        await this.billingService.resumeSubscription(tenantId, dto.plan);
    }

    @Get('subscription')
    @ApiOperation({ summary: 'Get subscription details' })
    @ApiResponse({ status: 200, description: 'Subscription details' })
    async getSubscription(@Req() req: Request): Promise<any> {
        const tenantId = (req as any).user?.tenant_id;
        return this.billingService.getSubscription(tenantId);
    }

    @Get('invoices')
    @ApiOperation({ summary: 'Get invoices' })
    @ApiResponse({ status: 200, description: 'Invoices retrieved' })
    async getInvoices(@Req() req: Request): Promise<any[]> {
        const tenantId = (req as any).user?.tenant_id;
        return this.billingService.getInvoices(tenantId);
    }

    @Get('payment-methods')
    @ApiOperation({ summary: 'Get payment methods' })
    @ApiResponse({ status: 200, description: 'Payment methods retrieved' })
    async getPaymentMethods(@Req() req: Request): Promise<any[]> {
        const tenantId = (req as any).user?.tenant_id;
        return this.billingService.getPaymentMethods(tenantId);
    }
}
