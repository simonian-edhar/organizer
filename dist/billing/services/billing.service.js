"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BillingService", {
    enumerable: true,
    get: function() {
        return BillingService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _Subscriptionentity = require("../../database/entities/Subscription.entity");
const _subscriptionenum = require("../../database/entities/enums/subscription.enum");
const _stripeservice = require("./stripe.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let BillingService = class BillingService {
    /**
     * Get subscription by tenant
     */ async getSubscription(tenantId) {
        return this.subscriptionRepository.findOne({
            where: {
                tenantId
            }
        });
    }
    /**
     * Cancel subscription
     */ async cancelSubscription(tenantId, atPeriodEnd) {
        const subscription = await this.getSubscription(tenantId);
        if (subscription.provider === 'stripe' && subscription.subscriptionExternalId) {
            await this.stripeService.cancelSubscription(subscription.subscriptionExternalId, atPeriodEnd);
        }
        // Update local status
        if (!atPeriodEnd) {
            await this.subscriptionRepository.update({
                id: subscription.id
            }, {
                status: _subscriptionenum.SubscriptionStatus.CANCELED,
                canceledAt: new Date()
            });
        } else {
            await this.subscriptionRepository.update({
                id: subscription.id
            }, {
                cancelAtPeriodEnd: true
            });
        }
    }
    /**
     * Resume subscription
     */ async resumeSubscription(tenantId, newPlan) {
        const subscription = await this.getSubscription(tenantId);
        if (subscription.provider === 'stripe' && subscription.subscriptionExternalId) {
            await this.stripeService.resumeSubscription(subscription.subscriptionExternalId);
            if (newPlan) {
                await this.stripeService.updateSubscriptionPlan(subscription.subscriptionExternalId, newPlan);
            }
        }
        // Update local status
        await this.subscriptionRepository.update({
            id: subscription.id
        }, {
            status: _subscriptionenum.SubscriptionStatus.ACTIVE,
            plan: newPlan || subscription.plan,
            cancelAtPeriodEnd: false,
            canceledAt: null
        });
    }
    /**
     * Get invoices
     */ async getInvoices(tenantId) {
        const subscription = await this.getSubscription(tenantId);
        if (subscription.provider === 'stripe' && subscription.externalId) {
            // TODO: Get invoices from Stripe
            return [];
        }
        return [];
    }
    /**
     * Get payment methods
     */ async getPaymentMethods(tenantId) {
        const subscription = await this.getSubscription(tenantId);
        if (subscription.provider === 'stripe' && subscription.externalId) {
            // TODO: Get payment methods from Stripe
            return [];
        }
        return [];
    }
    /**
     * Update subscription from webhook
     */ async updateSubscriptionFromWebhook(externalId, provider, data) {
        await this.subscriptionRepository.update({
            subscriptionExternalId: externalId,
            provider
        }, {
            ...data,
            lastSyncedAt: new Date()
        });
    }
    /**
     * Create subscription from webhook
     */ async createSubscriptionFromWebhook(tenantId, externalId, provider, data) {
        await this.subscriptionRepository.save({
            tenantId,
            provider,
            externalId,
            subscriptionExternalId: externalId,
            ...data,
            lastSyncedAt: new Date()
        });
    }
    constructor(subscriptionRepository, stripeService){
        this.subscriptionRepository = subscriptionRepository;
        this.stripeService = stripeService;
    }
};
BillingService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_Subscriptionentity.Subscription)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _stripeservice.StripeService === "undefined" ? Object : _stripeservice.StripeService
    ])
], BillingService);

//# sourceMappingURL=billing.service.js.map