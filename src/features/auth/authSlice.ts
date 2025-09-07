import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getItemAsync, setItemAsync, deleteItemAsync } from '../util/storage';
import { RootState } from 'src/store/store';
import SecureStoreEntry from 'src/enums/SecureStoreEntry';

interface AuthState {
  isLoggedIn: boolean;
  theme: string;
  logsRefreshInterval: number;
  logsSince: number;
  logsMaxLines: number;
  containerOrderBy: string | null;
  stackOrderBy: string | null;
  haveLoginDetailsSaved: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  theme: 'light',
  logsRefreshInterval: 1000,
  logsSince: 60000,
  logsMaxLines: 50,
  containerOrderBy: 'nameAsc',
  stackOrderBy: 'nameAsc',
  haveLoginDetailsSaved: false,
};

export const setProfileTheme = createAsyncThunk(
  "auth/setProfileTheme",
  async (theme: string) => {
    await setItemAsync(SecureStoreEntry.THEME, theme);
  }
);

export const setRefreshInterval = createAsyncThunk(
  "auth/setRefreshInterval",
  async (refreshInterval: SecureStoreEntry) => {
    await setItemAsync(SecureStoreEntry.LOGS_REFRESH_INTERVAL, refreshInterval)
    return refreshInterval;
  }
);

export const setLogsSince = createAsyncThunk(
  "auth/setLogsSince",
  async (logsSince: SecureStoreEntry) => {
    await setItemAsync(SecureStoreEntry.LOGS_SINCE, logsSince)
    return logsSince;
  }
);

export const setLogsMaxLines = createAsyncThunk(
  "auth/setLogsMaxLines",
  async (logsMaxLines: SecureStoreEntry) => {
    await setItemAsync(SecureStoreEntry.LOGS_MAX_LINES, logsMaxLines)
    return logsMaxLines;
  }
);

export const setContainerOrderBy = createAsyncThunk(
  "auth/setContainerOrderBy",
  async (containerOrderBy: string) => {
    await setItemAsync(SecureStoreEntry.CONTAINER_ORDER_BY, containerOrderBy)
    return containerOrderBy
  }
);

export const setStackOrderBy = createAsyncThunk(
  "auth/setStackOrderBy",
  async (stackOrderBy: string) => {
    await setItemAsync(SecureStoreEntry.STACK_ORDER_BY, stackOrderBy)
    return stackOrderBy
  }
);

export const setLoginApiKey = createAsyncThunk(
  "auth/setLoginApiKey",
  async ({hostUrl, apiKey}: any) => {
    await Promise.all([
      await setItemAsync(SecureStoreEntry.BASE_API_URL, hostUrl),
      await setItemAsync(SecureStoreEntry.API_KEY, apiKey)
    ]);
  }
);

export const setLogDefaults = createAsyncThunk(
  "auth/setLogDefaults",
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;

    
    const refreshInterval = await getItemAsync(SecureStoreEntry.LOGS_REFRESH_INTERVAL);
    if (refreshInterval === null || refreshInterval === undefined) {
      await setItemAsync(SecureStoreEntry.LOGS_REFRESH_INTERVAL, state.auth.logsRefreshInterval.toString());
    }

    const logsMaxLines = await getItemAsync(SecureStoreEntry.LOGS_MAX_LINES);
    if (logsMaxLines === null || logsMaxLines === undefined) {
      await setItemAsync(SecureStoreEntry.LOGS_MAX_LINES, state.auth.logsMaxLines.toString());
    }

    const logsSince = await getItemAsync(SecureStoreEntry.LOGS_SINCE);
    if (logsSince === null || logsSince === undefined) {
      await setItemAsync(SecureStoreEntry.LOGS_SINCE, state.auth.logsSince.toString());
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async(_, { dispatch }) => {
    try {
      await Promise.all([
        deleteItemAsync(SecureStoreEntry.BASE_API_URL),
        deleteItemAsync(SecureStoreEntry.API_KEY),
      ]);
      dispatch(haveLoginDetail())
      return true
    } catch {
      return false
    } 
  }
);

export const checkThemeStored = createAsyncThunk(
    "auth/checkThemeStored",
    async() => {
        const theme = await getItemAsync(SecureStoreEntry.THEME);
        if (theme) {
            return theme
        }
        return "light"
    }
);

export const getRefreshInterval = createAsyncThunk(
    "auth/getRefreshInterval", 
    async() => {
        const refreshInterval = await getItemAsync(SecureStoreEntry.LOGS_REFRESH_INTERVAL);
        if (refreshInterval !== null && refreshInterval !== undefined) {
            return parseInt(refreshInterval, 10)
        }
        return 1000
    }
);

export const getLogsSince = createAsyncThunk(
    "auth/getLogsSince", 
    async() => {
        const logsSince = await getItemAsync(SecureStoreEntry.LOGS_SINCE);
        
        if (logsSince !== null && logsSince !== undefined) {
            return parseInt(logsSince, 10)
        }
        return 60000
    }
);

export const getLogsMaxLines = createAsyncThunk(
    "auth/getLogsMaxLines", 
    async() => {
        const logsMaxLines = await getItemAsync(SecureStoreEntry.LOGS_MAX_LINES);
        if (logsMaxLines !== null && logsMaxLines !== undefined) {
            return parseInt(logsMaxLines, 10)
        }
        return 100
    }
);

export const getContainerOrderBy = createAsyncThunk(
    "auth/getContainerOrderBy", 
    async() => {
        const containerOrderBy = await getItemAsync(SecureStoreEntry.CONTAINER_ORDER_BY);
        if (containerOrderBy) {
            return containerOrderBy
        }
        return 'nameAsc'
    }
);

export const getStackOrderBy = createAsyncThunk("auth/getStackOrderBy",
    async() => {
        const stackOrderBy = await getItemAsync(SecureStoreEntry.STACK_ORDER_BY);
        if (stackOrderBy) {
            return stackOrderBy
        }
        return 'nameAsc'
    }
);

export const haveLoginDetail = createAsyncThunk("auth/haveLoginDetail",
  async () => {
    const baseApiUrl = await getItemAsync(SecureStoreEntry.BASE_API_URL);
    const apiKey = await getItemAsync(SecureStoreEntry.API_KEY);
    if (baseApiUrl && apiKey) {
        return true
    }
    return false
  },
)


export const toggleThemeAndPersist = createAsyncThunk(
  'auth/toggleThemeAndPersist',
  async (_, { dispatch, getState }) => {
    dispatch(toggleTheme()); // this changes the theme in Redux state

    const state = getState() as RootState;
    const newTheme = state.auth.theme;

    // persist to secure store
    await dispatch(setProfileTheme(newTheme as SecureStoreEntry));
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(logout.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload;
      })
      .addCase(checkThemeStored.fulfilled, (state, action) => {
        state.theme = action.payload;
      })
      .addCase(getRefreshInterval.fulfilled, (state, action) => {
        state.logsRefreshInterval = action.payload;
      })
      .addCase(getLogsSince.fulfilled, (state, action) => {
        state.logsSince = action.payload;
      })
      .addCase(getLogsMaxLines.fulfilled, (state, action) => {
        state.logsMaxLines = action.payload;
      })
      .addCase(getContainerOrderBy.fulfilled, (state, action) => {
        state.containerOrderBy = action.payload;
      })
      .addCase(getStackOrderBy.fulfilled, (state, action) => {
        state.stackOrderBy = action.payload;
      })
      .addCase(haveLoginDetail.fulfilled, (state, action) => {
        state.haveLoginDetailsSaved = action.payload;
      })
      .addCase(setContainerOrderBy.fulfilled, (state, action) => {
        state.containerOrderBy = action.payload;
      })
      .addCase(setStackOrderBy.fulfilled, (state, action) => {
        state.stackOrderBy = action.payload;
      })
      .addCase(setLogsSince.fulfilled, (state, action) => {
        state.logsSince = parseInt(action.payload, 10);
      })
      .addCase(setLogsMaxLines.fulfilled, (state, action) => {
        state.logsMaxLines = parseInt(action.payload, 10);
      })
      .addCase(setRefreshInterval.fulfilled, (state, action) => {
        state.logsRefreshInterval = parseInt(action.payload, 10);
      });
    
  },
});

export const { setLoggedIn, toggleTheme } = authSlice.actions;
export default authSlice.reducer;