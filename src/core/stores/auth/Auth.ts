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
