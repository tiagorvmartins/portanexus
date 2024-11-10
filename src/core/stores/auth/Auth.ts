import { injectable, provided } from "inversify-sugar";
import { makeAutoObservable } from "mobx";
import SecureStoreEntry from "src/core/domain/enums/SecureStoreEntry";
import ISecureStoreWrapper,  { ISecureStoreWrapperToken } from "src/core/domain/specifications/ISecureStoreWrapper";

@injectable()
export class Auth {
  private secureStoreWrapper: ISecureStoreWrapper
  private loggedIn: boolean = false

  constructor(
    @provided(ISecureStoreWrapperToken) 
    private readonly secureStoreWrapperInjected: ISecureStoreWrapper) {
    this.secureStoreWrapper = this.secureStoreWrapperInjected
    makeAutoObservable(this);
  }

  get isLoggedIn () {
    return this.loggedIn;
  }

  setLoggedIn (newLoggedIn: boolean) {
    this.loggedIn = newLoggedIn
  }

  setProfileTheme = async (theme: SecureStoreEntry) => {
    await this.secureStoreWrapper.setItemAsync(SecureStoreEntry.THEME, theme);
  }

  checkThemeStored = async () => {
    const theme = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.THEME);
    if (theme) {
      return theme
    }
    return "light"
  }

  setRefreshInterval = async (refreshInterval: SecureStoreEntry) => {
    await this.secureStoreWrapper.setItemAsync(SecureStoreEntry.LGOS_REFRESH_INTERVAL, refreshInterval);
  }

  getRefreshInterval = async () => {
    const refreshInterval = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.LGOS_REFRESH_INTERVAL);
    if (refreshInterval) {
      return parseInt(refreshInterval, 10)
    }
    return 1000
  }

  setLogsSince = async (refreshInterval: SecureStoreEntry) => {
    await this.secureStoreWrapper.setItemAsync(SecureStoreEntry.LOGS_SINCE, refreshInterval);
  }

  getLogsSince = async () => {
    const logsSince = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.LOGS_SINCE);
    if (logsSince) {
      return parseInt(logsSince, 10)
    }
    return 60000
  }

  setLogsMaxLines = async (logsMaxLines: SecureStoreEntry) => {
    await this.secureStoreWrapper.setItemAsync(SecureStoreEntry.LOGS_MAX_LINES, logsMaxLines);
  }

  getLogsMaxLines = async () => {
    const logsMaxLines = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.LOGS_MAX_LINES);
    if (logsMaxLines) {
      return parseInt(logsMaxLines, 10)
    }
    return 100
  }

  setContainerOrderBy = async (containerOrderBy: SecureStoreEntry) => {
    await this.secureStoreWrapper.setItemAsync(SecureStoreEntry.CONTAINER_ORDER_BY, containerOrderBy);
  }

  getContainerOrderBy = async () => {
    const containerOrderBy = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.CONTAINER_ORDER_BY);
    if (containerOrderBy) {
      return containerOrderBy
    }
    return 'containerNameAsc'
  } 

  setStackOrderBy = async (stackOrderBy: SecureStoreEntry) => {
    await this.secureStoreWrapper.setItemAsync(SecureStoreEntry.STACK_ORDER_BY, stackOrderBy);
  }

  getStackOrderBy = async () => {
    const stackOrderBy = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.STACK_ORDER_BY);
    if (stackOrderBy) {
      return stackOrderBy
    }
    return 'stackContainerName'
  } 

  setLoginApiKey = async (hostUrl: SecureStoreEntry, apiKey: SecureStoreEntry) => {
    await Promise.all([
      await this.secureStoreWrapper.setItemAsync(SecureStoreEntry.BASE_API_URL, hostUrl),
      await this.secureStoreWrapper.setItemAsync(SecureStoreEntry.API_KEY, apiKey)
    ]);
  }

  haveLoginDetail = async () => {
    const baseApiUrl = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.BASE_API_URL);
    const apiKey = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.API_KEY);
    if (baseApiUrl && apiKey) {
      return true
    }
    return false
  }

  logout = async () => {
    try {
      await Promise.all([
        this.secureStoreWrapper.deleteItemAsync(SecureStoreEntry.BASE_API_URL),
        this.secureStoreWrapper.deleteItemAsync(SecureStoreEntry.API_KEY),
      ]);
      this.setLoggedIn(false)
    } catch {
      this.setLoggedIn(false)
    } 
  } 
}
