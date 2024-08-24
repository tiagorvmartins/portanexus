import { injectable, provided } from "inversify-sugar";
import { IContainersRepository } from "../../domain/specifications/IContainersRepository";
import ContainerDto from "../models/ContainerDto";
import GetContainersResponse from "../../application/types/GetContainersResponse";
import GetContainersPayload from "../../application/types/GetContainersPayload";
import { plainToInstance } from "class-transformer";
import IHttpClient, { IHttpClientToken } from "src/core/domain/specifications/IHttpAxiosConnector";
import ContainerEntity from "src/containers/domain/entities/ContainerEntity";


@injectable()
class ContainersRepository implements IContainersRepository {
  private readonly baseUrl = "/endpoints";

  constructor(
    @provided(IHttpClientToken) private readonly httpClient: IHttpClient
  ) {}

  public async find(id: number): Promise<ContainerEntity> {
    try {
      const response = await this.httpClient.get<unknown>(`${this.baseUrl}/${id}`);
      const responseDto = plainToInstance(ContainerDto, response);
      return responseDto.toDomain();
    } catch {
      return {} as ContainerEntity
    }
  }

  public async get(payload: GetContainersPayload): Promise<GetContainersResponse> {
    try {
      const filters = encodeURIComponent(JSON.stringify(payload.filters))
      const stacks = (await this.httpClient.get<unknown[]>(`${this.baseUrl}/${payload.endpointId}/docker/containers/json?all=true&filters=${filters}`));
      const response: GetContainersResponse = {
        results: stacks.map((container: any) => plainToInstance(ContainerDto, container).toDomain()),
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
}

export default ContainersRepository;