"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get BillingPage () {
        return _billing.BillingPage;
    },
    get DashboardPage () {
        return _dashboard.DashboardPage;
    },
    get LoginPage () {
        return _auth.LoginPage;
    },
    get OnboardingWizard () {
        return _onboarding.OnboardingWizard;
    },
    get PaymentCancelPage () {
        return _billing.PaymentCancelPage;
    },
    get PaymentSuccessPage () {
        return _billing.PaymentSuccessPage;
    },
    get ProfilePage () {
        return _profile.ProfilePage;
    },
    get RegisterPage () {
        return _auth.RegisterPage;
    }
});
const _auth = require("./auth");
const _dashboard = require("./dashboard");
const _billing = require("./billing");
const _onboarding = require("./onboarding");
const _profile = require("./profile");

//# sourceMappingURL=index.js.map