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
    get clearUser () {
        return clearUser;
    },
    get default () {
        return _default;
    },
    get setError () {
        return setError;
    },
    get setLoading () {
        return setLoading;
    },
    get setUser () {
        return setUser;
    },
    get updateOrganization () {
        return updateOrganization;
    },
    get updateUser () {
        return updateUser;
    }
});
const _toolkit = require("@reduxjs/toolkit");
const initialState = {
    user: null,
    organization: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
};
const authSlice = (0, _toolkit.createSlice)({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action)=>{
            state.user = action.payload.user;
            state.organization = action.payload.organization;
            state.isAuthenticated = action.payload.isAuthenticated;
            state.isLoading = false;
            state.error = null;
        },
        clearUser: (state)=>{
            state.user = null;
            state.organization = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        },
        setLoading: (state, action)=>{
            state.isLoading = action.payload;
        },
        setError: (state, action)=>{
            state.error = action.payload;
            state.isLoading = false;
        },
        updateUser: (state, action)=>{
            if (state.user) {
                state.user = {
                    ...state.user,
                    ...action.payload
                };
            }
        },
        updateOrganization: (state, action)=>{
            if (state.organization) {
                state.organization = {
                    ...state.organization,
                    ...action.payload
                };
            }
        }
    }
});
const { setUser, clearUser, setLoading, setError, updateUser, updateOrganization } = authSlice.actions;
const _default = authSlice.reducer;

//# sourceMappingURL=auth.slice.js.map