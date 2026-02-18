"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StripeService", {
    enumerable: true,
    get: function() {
        return StripeService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _stripe = /*#__PURE__*/ _interop_require_default(require("stripe"));
const _subscriptionenum = require("../../database/entities/enums/subscription.enum");
const _auditservice = require("../../auth/services/audit.service");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let StripeService = class StripeService {
    /**
     * Create checkout session
     */ async createCheckoutSession(tenantId, dto) {
        const prices = this.getPlanPrices(dto.plan);
        // Check if customer exists
        let customerId = await this.getCustomerId(tenantId);
        if (!customerId) {
            // Create customer
            const customer = await this.stripe.customers.create({
                metadata: {
                    tenantId
                }
            });
            customerId = customer.id;
        }
        // Create checkout session
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: [
                'card'
            ],
            line_items: prices.map((price)=>({
                    price: price.id,
                    quantity: 1
                })),
            mode: 'subscription',
            success_url: dto.successUrl || `${this.configService.get('APP_URL')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: dto.cancelUrl || `${this.configService.get('APP_URL')}/billing/cancel`,
            subscription_data: {
                trial_period_days: dto.trial ? 14 : undefined,
                metadata: {
                    tenantId,
                    plan: dto.plan
                }
            },
            allow_promotion_codes: true
        });
        // Log audit
        await this.auditService.log({
            tenantId,
            action: 'create',
            entityType: 'CheckoutSession',
            entityId: session.id,
            metadata: {
                plan: dto.plan,
                trial: dto.trial
            }
        });
        return {
            checkoutUrl: session.url,
            sessionId: session.id
        };
    }
    /**
     * Create customer portal session
     */ async createPortalSession(tenantId, returnUrl) {
        const customerId = await this.getCustomerId(tenantId);
        if (!customerId) {
            throw new _common.BadRequestException('Customer not found');
        }
        const session = await this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl
        });
        return {
            url: session.url
        };
    }
    /**
     * Cancel subscription
     */ async cancelSubscription(subscriptionId, atPeriodEnd = true) {
        return this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: atPeriodEnd
        });
    }
    /**
     * Resume subscription
     */ async resumeSubscription(subscriptionId) {
        return this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false
        });
    }
    /**
     * Upgrade/Downgrade plan
     */ async updateSubscriptionPlan(subscriptionId, plan) {
        const price = this.getPlanPrice(plan);
        return this.stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    id: (await this.stripe.subscriptions.retrieve(subscriptionId)).items.data[0].id,
                    price: price.id
                }
            ],
            proration_behavior: 'create_prorations'
        });
    }
    /**
     * Handle webhook event
     */ async handleWebhook(payload, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (error) {
            throw new _common.BadRequestException('Invalid webhook signature');
        }
        // Handle different event types
        switch(event.type){
            case 'checkout.session.completed':
                await this.handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'customer.subscription.created':
                await this.handleSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.paid':
                await this.handleInvoicePaid(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.handleInvoicePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    }
    /**
     * Handle checkout session completed
     */ async handleCheckoutSessionCompleted(session) {
        const tenantId = session.metadata?.tenantId;
        const plan = session.metadata?.plan;
        if (!tenantId || !plan) {
            throw new _common.InternalServerErrorException('Missing metadata');
        }
        // TODO: Update subscription in database
        console.log('Checkout session completed', {
            tenantId,
            plan
        });
    }
    /**
     * Handle subscription created
     */ async handleSubscriptionCreated(subscription) {
        const tenantId = subscription.metadata?.tenantId;
        const plan = subscription.metadata?.plan;
        if (!tenantId) {
            throw new _common.InternalServerErrorException('Missing tenant_id in metadata');
        }
        // TODO: Create/update subscription in database
        console.log('Subscription created', {
            tenantId,
            plan,
            subscriptionId: subscription.id
        });
    }
    /**
     * Handle subscription updated
     */ async handleSubscriptionUpdated(subscription) {
        const tenantId = subscription.metadata?.tenantId;
        if (!tenantId) {
            return;
        }
        // Map Stripe status to our status
        const statusMap = {
            active: _subscriptionenum.SubscriptionStatus.ACTIVE,
            trialing: _subscriptionenum.SubscriptionStatus.TRIALING,
            past_due: _subscriptionenum.SubscriptionStatus.PAST_DUE,
            canceled: _subscriptionenum.SubscriptionStatus.CANCELED,
            unpaid: _subscriptionenum.SubscriptionStatus.UNPAID
        };
        const status = statusMap[subscription.status];
        if (!status) {
            return;
        }
        // TODO: Update subscription in database
        console.log('Subscription updated', {
            tenantId,
            status
        });
    }
    /**
     * Handle subscription deleted
     */ async handleSubscriptionDeleted(subscription) {
        const tenantId = subscription.metadata?.tenantId;
        if (!tenantId) {
            return;
        }
        // TODO: Update subscription to canceled in database
        console.log('Subscription deleted', {
            tenantId
        });
    }
    /**
     * Handle invoice paid
     */ async handleInvoicePaid(invoice) {
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) {
            return;
        }
        // TODO: Update subscription status to active
        console.log('Invoice paid', {
            subscriptionId
        });
    }
    /**
     * Handle invoice payment failed
     */ async handleInvoicePaymentFailed(invoice) {
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) {
            return;
        }
        // TODO: Update subscription status to past_due
        console.log('Invoice payment failed', {
            subscriptionId
        });
    }
    /**
     * Get customer ID for tenant
     */ async getCustomerId(tenantId) {
        const customers = await this.stripe.customers.list({
            metadata: {
                tenantId
            },
            limit: 1
        });
        return customers.data[0]?.id || null;
    }
    /**
     * Get price for plan
     */ getPlanPrice(plan) {
        const priceMap = {
            [_subscriptionenum.SubscriptionPlan.BASIC]: this.configService.get('STRIPE_PRICE_BASIC'),
            [_subscriptionenum.SubscriptionPlan.PROFESSIONAL]: this.configService.get('STRIPE_PRICE_PROFESSIONAL'),
            [_subscriptionenum.SubscriptionPlan.ENTERPRISE]: this.configService.get('STRIPE_PRICE_ENTERPRISE')
        };
        const priceId = priceMap[plan];
        if (!priceId) {
            throw new _common.InternalServerErrorException(`Price not configured for plan: ${plan}`);
        }
        return this.stripe.prices.retrieve(priceId);
    }
    /**
     * Get all prices for plan
     */ getPlanPrices(plan) {
        const prices = this.getPlanPrice(plan);
        return [
            prices
        ];
    }
    constructor(configService, auditService){
        this.configService = configService;
        this.auditService = auditService;
        const secretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (!secretKey) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }
        this.stripe = new _stripe.default(secretKey, {
            apiVersion: '2023-08-16'
        });
    }
};
StripeService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService,
        typeof _auditservice.AuditService === "undefined" ? Object : _auditservice.AuditService
    ])
], StripeService);

//# sourceMappingURL=stripe.service.js.map