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

  setLoginApiKey = async (hostUrl: SecureStoreEntry, apiKey: SecureStoreEntry) => {

    try {

      await Promise.all([
        await this.secureStoreWrapper.setItemAsync(SecureStoreEntry.BASE_API_URL, hostUrl),
        await this.secureStoreWrapper.setItemAsync(SecureStoreEntry.API_KEY, apiKey)
      ]);

      this.setLoggedIn(true)
    } catch {
      this.setLoggedIn(false)
    }
  }

  checkLogin = async () => {
    const baseApiUrl = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.BASE_API_URL);
    if (baseApiUrl) {
      const apiKey = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.API_KEY);
      if (apiKey) {
        this.setLoggedIn(true)
        return true
      } else {
        const username = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.USERNAME);
        const password = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.PASSWORD);
  
        if(username && password){
          this.setLoggedIn(true)
          return true
        }
      }
    }
    this.setLoggedIn(false)
    return false
  }

  setLoginUserAndPassword = async (hostUrl: SecureStoreEntry, username: SecureStoreEntry, password: SecureStoreEntry) => {
    try {

      await Promise.all([
        this.secureStoreWrapper.setItemAsync(SecureStoreEntry.BASE_API_URL, hostUrl),
        this.secureStoreWrapper.setItemAsync(SecureStoreEntry.USERNAME, username),
        this.secureStoreWrapper.setItemAsync(SecureStoreEntry.PASSWORD, password)
      ]);

      this.setLoggedIn(true)
    } catch {
      this.setLoggedIn(false)
    } 
  }

  logout = async () => {
    try {
      await Promise.all([
        this.secureStoreWrapper.deleteItemAsync(SecureStoreEntry.BASE_API_URL),
        this.secureStoreWrapper.deleteItemAsync(SecureStoreEntry.API_KEY),
        this.secureStoreWrapper.deleteItemAsync(SecureStoreEntry.USERNAME),
        this.secureStoreWrapper.deleteItemAsync(SecureStoreEntry.PASSWORD)
      ]);
      this.setLoggedIn(false)
    } catch {
      this.setLoggedIn(false)
    } 
  } 
}
