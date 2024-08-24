import { injectable, provided } from "inversify-sugar";
import { IStacksRepository } from "../../domain/specifications/IStacksRepository";
import StackDto from "../models/StackDto";
import { plainToInstance } from "class-transformer";
import GetStacksResponse from "../../application/types/GetStacksResponse";
import IHttpClient, { IHttpClientToken } from "src/core/domain/specifications/IHttpAxiosConnector";
import StackEntity from "src/stacks/domain/entities/StackEntity";
import GetStacksPayload from "src/stacks/application/types/GetStacksPayload";


@injectable()
class StacksRepository implements IStacksRepository {
  private readonly baseUrl = "/stacks";

  constructor(
    @provided(IHttpClientToken) private readonly httpClient: IHttpClient
  ) {}

  public async find(id: number): Promise<StackEntity> {
    try {
      const response = await this.httpClient.get<unknown>(`${this.baseUrl}/${id}`);
      const responseDto = plainToInstance(StackDto, response);
      return responseDto.toDomain();
    } catch {
      return {} as StackEntity
    }
  }

  public async get(data: GetStacksPayload): Promise<GetStacksResponse> {
    try {
      const filters = encodeURIComponent(JSON.stringify(data.filters))
      const stacks = (await this.httpClient.get<unknown[]>(`${this.baseUrl}?filters=${filters}`));
      const response: GetStacksResponse = {
        results: stacks.map((stack: any) => plainToInstance(StackDto, stack).toDomain()),
        count: stacks.length,
      };
      return response;
    } catch {
      return {
        results: [],
        count: 0
      }
    }
  }

  public async start(id: number): Promise<void> {
    return await this.httpClient.post(`${this.baseUrl}/${id}/start?endpointId=2`);
  }

  public async stop(id: number): Promise<void> {
    return await this.httpClient.post(`${this.baseUrl}/${id}/stop?endpointId=2`);
  }
}

export default StacksRepository;
