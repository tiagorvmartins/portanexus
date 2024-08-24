
import { injectable, provided } from "inversify-sugar";
import GetStacksResponse from "../types/GetStacksResponse";
import { UseCase } from "src/core/application/UseCase";
import GetStacksPayload from "../types/GetStacksPayload";
import { IStacksRepository, IStacksRepositoryToken } from "../../domain/specifications/IStacksRepository";

@injectable()
export default class GetStacksUseCase
  implements UseCase<GetStacksPayload, Promise<GetStacksResponse>>
{
  constructor(
    @provided(IStacksRepositoryToken)
    private readonly stacksRepository: IStacksRepository
  ) {}

  public execute(data: GetStacksPayload) {
      return this.stacksRepository.get(data);
  }
}
