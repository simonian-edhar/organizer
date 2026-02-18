import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Organization } from '../types/auth.types';

interface AuthState {
    user: User | null;
    organization: Organization | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    organization: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{
            user: User;
            organization: Organization;
            isAuthenticated: boolean;
        }>) => {
            state.user = action.payload.user;
            state.organization = action.payload.organization;
            state.isAuthenticated = action.payload.isAuthenticated;
            state.isLoading = false;
            state.error = null;
        },

        clearUser: (state) => {
            state.user = null;
            state.organization = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },

        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },

        updateOrganization: (state, action: PayloadAction<Partial<Organization>>) => {
            if (state.organization) {
                state.organization = { ...state.organization, ...action.payload };
            }
        },
    },
});

export const {
    setUser,
    clearUser,
    setLoading,
    setError,
    updateUser,
    updateOrganization,
} = authSlice.actions;

export default authSlice.reducer;
