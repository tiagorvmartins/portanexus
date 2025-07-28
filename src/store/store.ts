import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import containerReducer from '../features/container/containerSlice';
import endpointsReducer from '../features/endpoints/endpointsSlice';
import authSlice from 'src/features/auth/authSlice';
import loadingSlice from 'src/features/loading/loadingSlice';
import stackSlice from 'src/features/stacks/stacksSlice';

export const store = configureStore({
  reducer: {
    containers: containerReducer,
    endpoints: endpointsReducer,
    auth: authSlice,
    loading: loadingSlice,
    stacks: stackSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const selectContainers = (state: RootState) => state.containers;
export const selectEndpoints = (state: RootState) => state.endpoints;
export const selectAuth = (state: RootState) => state.auth;
export const selectLoading = (state: RootState) => state.loading;