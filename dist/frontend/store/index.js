"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "store", {
    enumerable: true,
    get: function() {
        return store;
    }
});
const _toolkit = require("@reduxjs/toolkit");
const _authslice = /*#__PURE__*/ _interop_require_default(require("./auth.slice"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const rootReducer = (0, _toolkit.combineReducers)({
    auth: _authslice.default
});
const store = (0, _toolkit.configureStore)({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware)=>getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE'
                ]
            }
        }),
    devTools: import.meta.env.DEV
});

//# sourceMappingURL=index.js.map