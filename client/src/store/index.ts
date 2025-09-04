import { configureStore } from '@reduxjs/toolkit';

// slices
import ocrApiReducer from './slices/ocrApiSlice';

export const store = configureStore({
  reducer: {
    // state slices
    ocrApiState: ocrApiReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ignore these action types for file objects and other non-serializable values
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['api.mutations', 'api.queries'],
      },
    }),

  // enable redux DevTools in development
  devTools: import.meta.env.VITE_ENV === 'development',
});

// export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;