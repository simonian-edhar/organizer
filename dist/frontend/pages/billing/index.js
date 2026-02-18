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
        return _BillingPage.BillingPage;
    },
    get PaymentCancelPage () {
        return _PaymentResult.PaymentCancelPage;
    },
    get PaymentSuccessPage () {
        return _PaymentResult.PaymentSuccessPage;
    }
});
const _BillingPage = require("./BillingPage");
const _PaymentResult = require("./PaymentResult");

//# sourceMappingURL=index.js.map