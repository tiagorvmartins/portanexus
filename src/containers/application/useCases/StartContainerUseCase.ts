
import { injectable, provided } from "inversify-sugar";
import { UseCase } from "src/core/application/UseCase";
import { IContainersRepository, IContainersRepositoryToken } from "../../domain/specifications/IContainersRepository";
import ControlContainerPayload from "../types/ControlContainerPayload";

@injectable()
export default class StartContainersUseCase
  implements UseCase<ControlContainerPayload, Promise<void>>
{
  constructor(
    @provided(IContainersRepositoryToken)
    private readonly containersRepository: IContainersRepository
  ) {}

  public async execute(data: ControlContainerPayload) {
      return this.containersRepository.start(data);
  }
}
