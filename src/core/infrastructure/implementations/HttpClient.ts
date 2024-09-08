import axios, { AxiosRequestConfig, AxiosStatic } from "axios";
import { provided, injectable } from "inversify-sugar";
import SecureStoreEntry from "src/core/domain/enums/SecureStoreEntry";
import IHttpClient from "src/core/domain/specifications/IHttpAxiosConnector";
import ISecureStoreWrapper, { ISecureStoreWrapperToken } from "src/core/domain/specifications/ISecureStoreWrapper";

@injectable()
class HttpClient implements IHttpClient {  
  private secureStoreWrapper: ISecureStoreWrapper
  private requestInterceptorId: number | null = null;
  private responseInterceptorId: number | null = null;

  constructor(@provided(ISecureStoreWrapperToken) private readonly secureStoreWrapperInjected: ISecureStoreWrapper) {
    this.secureStoreWrapper = this.secureStoreWrapperInjected
  }

  public async initialize(): Promise<AxiosStatic> {    
    const baseApiUrl = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.BASE_API_URL);
    const apiKey = await this.secureStoreWrapper.getItemAsync(SecureStoreEntry.API_KEY);
    if (baseApiUrl && apiKey) {
      
        if (this.requestInterceptorId !== null) {
          axios.interceptors.request.eject(this.requestInterceptorId);
        }
        if (this.responseInterceptorId !== null) {
          axios.interceptors.response.eject(this.responseInterceptorId);
        }

        this.requestInterceptorId = axios.interceptors.request.use((requestConfig) => {
          requestConfig.baseURL = baseApiUrl;
          requestConfig.headers['X-API-Key'] = apiKey;
          return requestConfig;
        });

        this.responseInterceptorId = axios.interceptors.response.use(undefined, (err) => {
          if (err.response) {
            if (err.response.status === 401 || 403) {
              console.error("Authorization error:", err);
            }
          }
          return Promise.reject(err);
        });
        return axios
      
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
