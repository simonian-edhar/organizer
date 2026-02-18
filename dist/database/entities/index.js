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
    get AuditLog () {
        return _AuditLogentity.AuditLog;
    },
    get Calculation () {
        return _Calculationentity.Calculation;
    },
    get CalculationItem () {
        return _CalculationItementity.CalculationItem;
    },
    get Case () {
        return _Caseentity.Case;
    },
    get Client () {
        return _Cliententity.Client;
    },
    get Document () {
        return _Documententity.Document;
    },
    get Event () {
        return _Evententity.Event;
    },
    get Invitation () {
        return _Invitationentity.Invitation;
    },
    get Invoice () {
        return _Invoiceentity.Invoice;
    },
    get OnboardingProgress () {
        return _OnboardingProgressentity.OnboardingProgress;
    },
    get Organization () {
        return _Organizationentity.Organization;
    },
    get PasswordReset () {
        return _PasswordResetentity.PasswordReset;
    },
    get Pricelist () {
        return _Pricelistentity.Pricelist;
    },
    get PricelistItem () {
        return _PricelistItementity.PricelistItem;
    },
    get RefreshToken () {
        return _RefreshTokenentity.RefreshToken;
    },
    get Subscription () {
        return _Subscriptionentity.Subscription;
    },
    get User () {
        return _Userentity.User;
    }
});
const _Organizationentity = require("./Organization.entity");
const _Userentity = require("./User.entity");
const _RefreshTokenentity = require("./RefreshToken.entity");
const _PasswordResetentity = require("./PasswordReset.entity");
const _Subscriptionentity = require("./Subscription.entity");
const _Invitationentity = require("./Invitation.entity");
const _OnboardingProgressentity = require("./OnboardingProgress.entity");
const _AuditLogentity = require("./AuditLog.entity");
const _Cliententity = require("./Client.entity");
const _Caseentity = require("./Case.entity");
const _Documententity = require("./Document.entity");
const _Evententity = require("./Event.entity");
const _Pricelistentity = require("./Pricelist.entity");
const _PricelistItementity = require("./PricelistItem.entity");
const _Calculationentity = require("./Calculation.entity");
const _CalculationItementity = require("./CalculationItem.entity");
const _Invoiceentity = require("./Invoice.entity");
_export_star(require("./enums/subscription.enum"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}

//# sourceMappingURL=index.js.map