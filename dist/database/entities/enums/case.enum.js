/**
 * Case-related Enums
 */ "use strict";
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
    get CasePriority () {
        return CasePriority;
    },
    get CaseStatus () {
        return CaseStatus;
    },
    get CaseType () {
        return CaseType;
    }
});
var CaseStatus = /*#__PURE__*/ function(CaseStatus) {
    CaseStatus["DRAFT"] = "draft";
    CaseStatus["ACTIVE"] = "active";
    CaseStatus["ON_HOLD"] = "on_hold";
    CaseStatus["CLOSED"] = "closed";
    CaseStatus["ARCHIVED"] = "archived";
    return CaseStatus;
}({});
var CasePriority = /*#__PURE__*/ function(CasePriority) {
    CasePriority["LOW"] = "low";
    CasePriority["MEDIUM"] = "medium";
    CasePriority["HIGH"] = "high";
    CasePriority["URGENT"] = "urgent";
    return CasePriority;
}({});
var CaseType = /*#__PURE__*/ function(CaseType) {
    CaseType["CIVIL"] = "civil";
    CaseType["CRIMINAL"] = "criminal";
    CaseType["ADMINISTRATIVE"] = "administrative";
    CaseType["ECONOMIC"] = "economic";
    CaseType["FAMILY"] = "family";
    CaseType["LABOR"] = "labor";
    CaseType["TAX"] = "tax";
    CaseType["OTHER"] = "other";
    return CaseType;
}({});

//# sourceMappingURL=case.enum.js.map