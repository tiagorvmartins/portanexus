import { getModuleContainer, module } from "inversify-sugar";
import { GetContainersStore } from "./presentation/stores/GetContainersStore/GetContainersStore";
import { IContainersRepositoryToken } from "./domain/specifications/IContainersRepository"
import ContainersRepository from "./infrastructure/implementations/ContainerRepository"
import GetContainersUseCase from "./application/useCases/GetContainersUseCase"
import StartContainersUseCase from "./application/useCases/StartContainerUseCase";
import StopContainersUseCase from "./application/useCases/StopContainerUseCase";
import GetContainerLogsUseCase from "./application/useCases/GetContainerLogsUseCase";
import GetContainerStatsUseCase from "./application/useCases/GetContainerStatsUseCase";
@module({
  providers: [
    {
      provide: IContainersRepositoryToken,
      useClass: ContainersRepository,
    },
    GetContainersUseCase,
    GetContainerLogsUseCase,
    GetContainerStatsUseCase,
    StartContainersUseCase,
    StopContainersUseCase,
    {
      useClass: GetContainersStore,
      scope: "Transient",
    },    
  ],
})
export class ContainerModule {}

export const containerModuleContainer = getModuleContainer(ContainerModule);