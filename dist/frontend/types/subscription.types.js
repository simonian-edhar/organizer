/**
 * Subscription Types
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PLAN_LIMITS", {
    enumerable: true,
    get: function() {
        return PLAN_LIMITS;
    }
});
const PLAN_LIMITS = {
    basic: {
        maxUsers: 1,
        mfa: false,
        sso: false,
        advancedAudit: false,
        customDomain: false,
        apiAccess: false,
        webhooks: false,
        customReports: false,
        prioritySupport: false,
        dataExport: true
    },
    professional: {
        maxUsers: 5,
        mfa: true,
        sso: false,
        advancedAudit: true,
        customDomain: false,
        apiAccess: true,
        webhooks: true,
        customReports: false,
        prioritySupport: false,
        dataExport: true
    },
    enterprise: {
        maxUsers: -1,
        mfa: true,
        sso: true,
        advancedAudit: true,
        customDomain: true,
        apiAccess: true,
        webhooks: true,
        customReports: true,
        prioritySupport: true,
        dataExport: true
    }
};

//# sourceMappingURL=subscription.types.js.map