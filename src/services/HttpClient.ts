import axios, { AxiosRequestConfig, AxiosStatic } from "axios";
import IHttpClient from "src/types/IHttpAxiosConnector";
import ISecureStoreWrapper from "src/types/ISecureStoreWrapper";
import SecureStoreWrapper from './SecureStoreWrapper'; // Import singleton instance
import SecureStoreEntry from "src/enums/SecureStoreEntry";

class HttpClient implements IHttpClient { 
  private static instance: HttpClient; 
  private secureStoreWrapper !: ISecureStoreWrapper;
  private requestInterceptorId: number | null = null;
  private responseInterceptorId: number | null = null;

  constructor() {
    if (!HttpClient.instance) {
        if (!this.secureStoreWrapper) {
            this.secureStoreWrapper = new SecureStoreWrapper()
        }
        HttpClient.instance = this;
    }

    return HttpClient.instance
  }

  public static get Instance(){
    return this.instance || (this.instance = new this());
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
