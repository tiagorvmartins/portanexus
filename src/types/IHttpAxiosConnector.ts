import { AxiosRequestConfig } from "axios";

export default interface IHttpClient {
  initialize(): void;

  get<ResponseType>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ResponseType>;

  post<DataType, ResponseType>(
    url: string,
    data?: DataType,
    config?: AxiosRequestConfig
  ): Promise<ResponseType>;

  patch<DataType, ResponseType>(
    url: string,
    data?: DataType,
    config?: AxiosRequestConfig
  ): Promise<ResponseType>;

  delete<ResponseType>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ResponseType>;
}
