
import { injectable, provided } from "inversify-sugar";
import { UseCase } from "src/core/application/UseCase";
import { IContainersRepository, IContainersRepositoryToken } from "../../domain/specifications/IContainersRepository";
import GetContainerStatsPayload from "../types/GetStatsPayload";
import GetContainerStatsResponse from "../types/GetContainerStatsResponse";

@injectable()
export default class GetContainerStatsUseCase
  implements UseCase<GetContainerStatsPayload, Promise<GetContainerStatsResponse>>
{
  constructor(
    @provided(IContainersRepositoryToken)
    private readonly containersRepository: IContainersRepository
  ) {}

  public execute(data: GetContainerStatsPayload) {
      return this.containersRepository.getContainerStats(data)
  }
}
