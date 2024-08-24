import { getModuleContainer, module } from "inversify-sugar";
import { GetStacksStore } from "./presentation/stores/GetStacksStore/GetStacksStore";
import { IStacksRepositoryToken } from "./domain/specifications/IStacksRepository";
import StacksRepository from "./infrastructure/implementations/StacksRepository";
import GetStacksUseCase from "./application/useCases/GetStacksUseCase";
import StopStackUseCase from "./application/useCases/StopStackUseCase";
import StartStackUseCase from "./application/useCases/StartStackUseCase";
import { GetContainersStore } from "src/containers/presentation/stores/GetContainersStore/GetContainersStore";

@module({
  providers: [
    {
      provide: IStacksRepositoryToken,
      useClass: StacksRepository,
    },
    GetStacksUseCase,
    StartStackUseCase,
    StopStackUseCase,
    {
      useClass: GetStacksStore,
      scope: "Transient",
    },
    {
      useClass: GetContainersStore,
      scope: "Transient",
    },
  ],
})
export class StackModule {}

export const stackModuleContainer = getModuleContainer(StackModule);