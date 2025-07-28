import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import {
    setProfileTheme,
    setRefreshInterval,
    setLogsSince,
    setLogsMaxLines,
    setContainerOrderBy,
    setStackOrderBy,
    setLoginApiKey,
    logout,
    checkThemeStored,
    getRefreshInterval,
    getLogsSince,
    getLogsMaxLines,
    getContainerOrderBy,
    getStackOrderBy,
    haveLoginDetail,
    setLoggedIn,
    toggleThemeAndPersist,
} from '../features/auth/authSlice';
import { SetLoginArgs } from 'src/types/LoginArgs';
import SecureStoreEntry from 'src/enums/SecureStoreEntry';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, theme, haveLoginDetailsSaved, stackOrderBy, containerOrderBy, logsSince, logsMaxLines, logsRefreshInterval } = useSelector((state: RootState) => state.auth);
  
  return {
    isLoggedIn,
    theme,
    haveLoginDetailsSaved,
    containerOrderBy,
    stackOrderBy,
    logsSince,
    logsMaxLines,
    logsRefreshInterval,
    toggleThemeAndPersist: () => { dispatch(toggleThemeAndPersist()) },
    setLoggedIn: (arg: boolean) => dispatch(setLoggedIn(arg)),
    setProfileTheme: (theme: SecureStoreEntry) => { dispatch(setProfileTheme(theme)) },
    setRefreshInterval: (refreshInterval: SecureStoreEntry) => { dispatch(setRefreshInterval(refreshInterval)) },
    setLogsSince: (logsSince: SecureStoreEntry) => { dispatch(setLogsSince(logsSince)) },
    setLogsMaxLines: (logsMaxLines: SecureStoreEntry) => { dispatch(setLogsMaxLines(logsMaxLines)) },
    setContainerOrderBy: (containerOrderBy: SecureStoreEntry) => { dispatch(setContainerOrderBy(containerOrderBy)) },
    setStackOrderBy: (stackOrderBy: SecureStoreEntry) => { dispatch(setStackOrderBy(stackOrderBy)) },
    setLoginApiKey: (loginArgs: SetLoginArgs) => dispatch(setLoginApiKey(loginArgs)),
    logout: () => dispatch(logout()),
    checkThemeStored: () => dispatch(checkThemeStored()),
    getRefreshInterval: () => dispatch(getRefreshInterval()),
    getLogsSince: () => dispatch(getLogsSince()),
    getLogsMaxLines: () => dispatch(getLogsMaxLines()),
    getContainerOrderBy: () => dispatch(getContainerOrderBy()),
    getStackOrderBy: () => dispatch(getStackOrderBy()),
    haveLoginDetail: () => dispatch(haveLoginDetail()),
  };
};