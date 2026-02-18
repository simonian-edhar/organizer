"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "subscriptionService", {
    enumerable: true,
    get: function() {
        return subscriptionService;
    }
});
const _api = /*#__PURE__*/ _interop_require_default(require("./api"));
const _subscriptiontypes = require("../types/subscription.types");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const subscriptionService = {
    /**
     * Get current subscription
     */ async getSubscription () {
        return _api.default.get('/organizations/subscription');
    },
    /**
     * Get plan features
     */ getPlanFeatures (plan) {
        return _subscriptiontypes.PLAN_LIMITS[plan];
    },
    /**
     * Check if plan has feature
     */ hasFeature (plan, feature) {
        return !!_subscriptiontypes.PLAN_LIMITS[plan]?.[feature];
    },
    /**
     * Get plan limits
     */ getPlanLimit (plan, limit) {
        return _subscriptiontypes.PLAN_LIMITS[plan]?.[limit];
    },
    /**
     * Upgrade plan
     */ async upgradePlan (plan) {
        return _api.default.post('/billing/checkout', {
            plan
        });
    },
    /**
     * Cancel subscription
     */ async cancelSubscription () {
        await _api.default.post('/billing/cancel');
    },
    /**
     * Resume subscription
     */ async resumeSubscription () {
        await _api.default.post('/billing/resume');
    },
    /**
     * Update payment method
     */ async updatePaymentMethod (paymentMethodId) {
        await _api.default.put('/billing/payment-method', {
            paymentMethodId
        });
    },
    /**
     * Get invoices
     */ async getInvoices () {
        return _api.default.get('/billing/invoices');
    },
    /**
     * Download invoice
     */ downloadInvoice (invoiceId, filename) {
        _api.default.download(`/billing/invoices/${invoiceId}/download`, filename);
    }
};

//# sourceMappingURL=subscription.service.js.map