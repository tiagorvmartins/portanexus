
import { injectable, provided } from "inversify-sugar";

import GetEndpointsResponse from "../types/GetEndpointsResponse";
import GetEndpointsPayload from "../types/GetEndpointsPayload";
import { UseCase } from "src/core/application/UseCase";
import { IEndpointRepository, IEndpointRepositoryToken } from "../../domain/specifications/IEndpointRepository";

@injectable()
export default class GetEndpointsUseCase
  implements UseCase<GetEndpointsPayload, Promise<GetEndpointsResponse>>
{
  constructor(
    @provided(IEndpointRepositoryToken)
    private readonly endpointsRepository: IEndpointRepository
  ) {}

  public execute(data: GetEndpointsPayload) {
      return this.endpointsRepository.get(data);
  }
}
