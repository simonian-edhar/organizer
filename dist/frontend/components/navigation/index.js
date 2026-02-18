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
    get FeatureFlag () {
        return _Navigation.FeatureFlag;
    },
    get MobileNavigation () {
        return _Navigation.MobileNavigation;
    },
    get PermissionBased () {
        return _Navigation.PermissionBased;
    },
    get RoleBased () {
        return _Navigation.RoleBased;
    },
    get SidebarNavigation () {
        return _Navigation.SidebarNavigation;
    },
    get TopNavigation () {
        return _Navigation.TopNavigation;
    }
});
const _Navigation = require("./Navigation");

//# sourceMappingURL=index.js.map