
import { injectable, provided } from "inversify-sugar";

import GetContainersResponse from "../types/GetContainersResponse";
import GetContainersPayload from "../types/GetContainersPayload";
import { UseCase } from "src/core/application/UseCase";
import { IContainersRepository, IContainersRepositoryToken } from "../../domain/specifications/IContainersRepository";

@injectable()
export default class GetContainersUseCase
  implements UseCase<GetContainersPayload, Promise<GetContainersResponse>>
{
  constructor(
    @provided(IContainersRepositoryToken)
    private readonly containersRepository: IContainersRepository
  ) {}

  public execute(data: GetContainersPayload) {
      return this.containersRepository.get(data);
  }
}
