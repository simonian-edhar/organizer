"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "organizationService", {
    enumerable: true,
    get: function() {
        return organizationService;
    }
});
const _api = /*#__PURE__*/ _interop_require_default(require("./api"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const organizationService = {
    /**
     * Get current organization
     */ async getOrganization () {
        return _api.default.get('/organizations/me');
    },
    /**
     * Update organization
     */ async updateOrganization (data) {
        return _api.default.put('/organizations/me', data);
    },
    /**
     * Get subscription status
     */ async getSubscription () {
        return _api.default.get('/organizations/subscription');
    },
    /**
     * Get onboarding progress
     */ async getOnboardingProgress () {
        return _api.default.get('/organizations/onboarding');
    },
    /**
     * Update onboarding step
     */ async updateOnboardingStep (step, completed, data) {
        await _api.default.patch(`/organizations/onboarding/${step}`, {
            completed,
            data
        });
    }
};

//# sourceMappingURL=organization.service.js.map