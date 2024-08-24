
import { injectable, provided } from "inversify-sugar";
import { UseCase } from "src/core/application/UseCase";
import { IStacksRepository, IStacksRepositoryToken } from "../../domain/specifications/IStacksRepository";

@injectable()
export default class StopStackUseCase
  implements UseCase<number, Promise<void>>
{
  constructor(
    @provided(IStacksRepositoryToken)
    private readonly stacksRepository: IStacksRepository
  ) {}

  public execute(id: number) {
      return this.stacksRepository.stop(id);
  }
}
