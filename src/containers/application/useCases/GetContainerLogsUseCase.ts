
import { injectable, provided } from "inversify-sugar";
import { UseCase } from "src/core/application/UseCase";
import { IContainersRepository, IContainersRepositoryToken } from "../../domain/specifications/IContainersRepository";
import GetContainerLogsResponse from "../types/GetContainerLogsResponse";
import GetContainerLogsPayload from "../types/GetLogsPayload";

@injectable()
export default class GetContainerLogsUseCase
  implements UseCase<GetContainerLogsPayload, Promise<GetContainerLogsResponse>>
{
  constructor(
    @provided(IContainersRepositoryToken)
    private readonly containersRepository: IContainersRepository
  ) {}

  public execute(data: GetContainerLogsPayload) {
      return this.containersRepository.getContainerLogs(data)
  }
}
