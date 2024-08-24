import { getModuleContainer, module } from "inversify-sugar";
import { GetContainersStore } from "./presentation/stores/GetContainersStore/GetContainersStore";
import { IContainersRepositoryToken } from "./domain/specifications/IContainersRepository"
import ContainersRepository from "./infrastructure/implementations/ContainerRepository"
import GetContainersUseCase from "./application/useCases/GetContainersUseCase"
@module({
  providers: [
    {
      provide: IContainersRepositoryToken,
      useClass: ContainersRepository,
    },
    GetContainersUseCase,
    {
      useClass: GetContainersStore,
      scope: "Transient",
    },    
  ],
})
export class ContainerModule {}

export const containerModuleContainer = getModuleContainer(ContainerModule);