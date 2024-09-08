import { injectable, provided } from "inversify-sugar";
import { IEndpointRepository } from "../../domain/specifications/IEndpointRepository";
import EndpointDto from "../models/EndpointDto";
import GetEndpointsResponse from "../../application/types/GetEndpointsResponse";
import { plainToInstance } from "class-transformer";
import IHttpClient, { IHttpClientToken } from "src/core/domain/specifications/IHttpAxiosConnector";

@injectable()
class EndpointsRepository implements IEndpointRepository {
  private readonly baseUrl = "/endpoints";

  constructor(
    @provided(IHttpClientToken) private readonly httpClient: IHttpClient
  ) {}

  public async get(): Promise<GetEndpointsResponse> {
    const endpoints = (await this.httpClient.get<unknown[]>(`${this.baseUrl}`));
    const response: GetEndpointsResponse = {
      results: endpoints.map((container: any) => plainToInstance(EndpointDto, container).toDomain()),
      count: endpoints.length,
    };
    return response;
  }
}

export default EndpointsRepository;
