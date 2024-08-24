import axios, { AxiosRequestConfig, AxiosStatic } from "axios";
import { provided, injectable } from "inversify-sugar";
import SecureStoreEntry from "src/core/domain/enums/SecureStoreEntry";
import IHttpClient from "src/core/domain/specifications/IHttpAxiosConnector";
import ISecureStoreWrapper, { ISecureStoreWrapperToken } from "src/core/domain/specifications/ISecureStoreWrapper";

@injectable()
class HttpClient implements IHttpClient {  
  private secureStoreWrapper: ISecureStoreWrapper
  private axios: typeof axios | null

  constructor(@provided(ISecureStoreWrapperToken) private readonly secureStoreWrapperInjected: ISecureStoreWrapper) {
    this.secureStoreWrapper = this.secureStoreWrapperInjected
    this.axios = null
  }

  public async initialize(): Promise<AxiosStatic> {
    if(this.axios)
      return this.axios
    
    const baseApiUrl = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.BASE_API_URL);
    if (baseApiUrl) {
      const apiKey = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.API_KEY);
      if (apiKey) {
        axios.interceptors.request.use((requestConfig) => {
          requestConfig.baseURL = baseApiUrl;
          requestConfig.headers.set("X-API-Key", apiKey)
          return requestConfig;
        });

        axios.interceptors.response.use(undefined, (err: any) => {
          if (err.response) {
            if (err.response.status === 401 || err.response.status === 403) {
              console.error(err)
            }
          }
          return Promise.reject(err);
        });
        this.axios = axios
        return this.axios
      }
    }
    return Promise.reject(null)
  }

  public get<ResponseType>(url: string, config?: AxiosRequestConfig) {
    return this.initialize()
        .then((axios: AxiosStatic) => axios.get<ResponseType>(url, config))
        .then((response) => response.data);
  }

  public post<DataType, ResponseType>(
    url: string,
    data?: DataType,
    config?: AxiosRequestConfig
  ) {
    return this.initialize()
      .then((axios: AxiosStatic) => axios.post<ResponseType>(url, data, config))
      .then((response) => response.data)
  }

  public patch<DataType, ResponseType>(
    url: string,
    data?: DataType,
    config?: AxiosRequestConfig
  ) {
    return this.initialize()
      .then((axios: AxiosStatic) => axios.patch<ResponseType>(url, data, config))
      .then((response) => response.data);
  }

  public delete<ResponseType>(url: string, config?: AxiosRequestConfig) {
      return this.initialize()
      .then((axios: AxiosStatic) => axios.delete<ResponseType>(url, config))
      .then((response) => response.data);
  }
}

export default HttpClient;
