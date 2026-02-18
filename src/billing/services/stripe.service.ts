import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Subscription } from '../../database/entities/Subscription.entity';
import { SubscriptionStatus, SubscriptionPlan } from '../../database/entities/enums/subscription.enum';
import { CreateCheckoutSessionDto } from '../dto/billing.dto';
import { AuditService } from '../../auth/services/audit.service';

/**
 * Stripe Service
 */
@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(
        private readonly configService: ConfigService,
        private readonly auditService: AuditService,
    ) {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

        if (!secretKey) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }

        this.stripe = new Stripe(secretKey, {
            apiVersion: '2023-08-16',
        });
    }

    /**
     * Create checkout session
     */
    async createCheckoutSession(
        tenantId: string,
        dto: CreateCheckoutSessionDto,
    ): Promise<{ checkoutUrl: string; sessionId: string }> {
        const prices = this.getPlanPrices(dto.plan);

        // Check if customer exists
        let customerId = await this.getCustomerId(tenantId);

        if (!customerId) {
            // Create customer
            const customer = await this.stripe.customers.create({
                metadata: { tenantId },
            });

            customerId = customer.id;
        }

        // Create checkout session
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: prices.map(price => ({
                price: price.id,
                quantity: 1,
            })),
            mode: 'subscription',
            success_url: dto.successUrl || `${this.configService.get('APP_URL')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: dto.cancelUrl || `${this.configService.get('APP_URL')}/billing/cancel`,
            subscription_data: {
                trial_period_days: dto.trial ? 14 : undefined,
                metadata: { tenantId, plan: dto.plan },
            },
            allow_promotion_codes: true,
        });

        // Log audit
        await this.auditService.log({
            tenantId,
            action: 'create',
            entityType: 'CheckoutSession',
            entityId: session.id,
            metadata: {
                plan: dto.plan,
                trial: dto.trial,
            },
        });

        return {
            checkoutUrl: session.url!,
            sessionId: session.id,
        };
    }

    /**
     * Create customer portal session
     */
    async createPortalSession(
        tenantId: string,
        returnUrl: string,
    ): Promise<{ url: string }> {
        const customerId = await this.getCustomerId(tenantId);

        if (!customerId) {
            throw new BadRequestException('Customer not found');
        }

        const session = await this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        return { url: session.url! };
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(
        subscriptionId: string,
        atPeriodEnd: boolean = true,
    ): Promise<Stripe.Subscription> {
        return this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: atPeriodEnd,
        });
    }

    /**
     * Resume subscription
     */
    async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
        return this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false,
        });
    }

    /**
     * Upgrade/Downgrade plan
     */
    async updateSubscriptionPlan(
        subscriptionId: string,
        plan: SubscriptionPlan,
    ): Promise<Stripe.Subscription> {
        const price = this.getPlanPrice(plan);

        return this.stripe.subscriptions.update(subscriptionId, {
            items: [{
                id: (await this.stripe.subscriptions.retrieve(subscriptionId)).items.data[0].id,
                price: price.id,
            }],
            proration_behavior: 'create_prorations',
        });
    }

    /**
     * Handle webhook event
     */
    async handleWebhook(payload: string, signature: string): Promise<void> {
        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        }

        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                webhookSecret
            );
        } catch (error) {
            throw new BadRequestException('Invalid webhook signature');
        }

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case 'customer.subscription.created':
                await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            case 'invoice.paid':
                await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.payment_failed':
                await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    }

    /**
     * Handle checkout session completed
     */
    private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
        const tenantId = session.metadata?.tenantId;
        const plan = session.metadata?.plan as SubscriptionPlan;

        if (!tenantId || !plan) {
            throw new InternalServerErrorException('Missing metadata');
        }

        // TODO: Update subscription in database
        console.log('Checkout session completed', { tenantId, plan });
    }

    /**
     * Handle subscription created
     */
    private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
        const tenantId = subscription.metadata?.tenantId;
        const plan = subscription.metadata?.plan as SubscriptionPlan;

        if (!tenantId) {
            throw new InternalServerErrorException('Missing tenant_id in metadata');
        }

        // TODO: Create/update subscription in database
        console.log('Subscription created', { tenantId, plan, subscriptionId: subscription.id });
    }

    /**
     * Handle subscription updated
     */
    private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
        const tenantId = subscription.metadata?.tenantId;

        if (!tenantId) {
            return;
        }

        // Map Stripe status to our status
        const statusMap: Record<string, SubscriptionStatus> = {
            active: SubscriptionStatus.ACTIVE,
            trialing: SubscriptionStatus.TRIALING,
            past_due: SubscriptionStatus.PAST_DUE,
            canceled: SubscriptionStatus.CANCELED,
            unpaid: SubscriptionStatus.UNPAID,
        };

        const status = statusMap[subscription.status];

        if (!status) {
            return;
        }

        // TODO: Update subscription in database
        console.log('Subscription updated', { tenantId, status });
    }

    /**
     * Handle subscription deleted
     */
    private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
        const tenantId = subscription.metadata?.tenantId;

        if (!tenantId) {
            return;
        }

        // TODO: Update subscription to canceled in database
        console.log('Subscription deleted', { tenantId });
    }

    /**
     * Handle invoice paid
     */
    private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
            return;
        }

        // TODO: Update subscription status to active
        console.log('Invoice paid', { subscriptionId });
    }

    /**
     * Handle invoice payment failed
     */
    private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
            return;
        }

        // TODO: Update subscription status to past_due
        console.log('Invoice payment failed', { subscriptionId });
    }

    /**
     * Get customer ID for tenant
     */
    private async getCustomerId(tenantId: string): Promise<string | null> {
        const customers = await this.stripe.customers.list({
            metadata: { tenantId },
            limit: 1,
        });

        return customers.data[0]?.id || null;
    }

    /**
     * Get price for plan
     */
    private getPlanPrice(plan: SubscriptionPlan): Stripe.Price {
        const priceMap: Record<SubscriptionPlan, string> = {
            [SubscriptionPlan.BASIC]: this.configService.get('STRIPE_PRICE_BASIC')!,
            [SubscriptionPlan.PROFESSIONAL]: this.configService.get('STRIPE_PRICE_PROFESSIONAL')!,
            [SubscriptionPlan.ENTERPRISE]: this.configService.get('STRIPE_PRICE_ENTERPRISE')!,
        };

        const priceId = priceMap[plan];

        if (!priceId) {
            throw new InternalServerErrorException(`Price not configured for plan: ${plan}`);
        }

        return this.stripe.prices.retrieve(priceId);
    }

    /**
     * Get all prices for plan
     */
    private getPlanPrices(plan: SubscriptionPlan): Stripe.Price[] {
        const prices = this.getPlanPrice(plan);
        return [prices];
    }
}
