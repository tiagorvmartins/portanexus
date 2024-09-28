import { getModuleContainer, module } from "inversify-sugar";
import { GetEndpointsStore } from "./presentation/stores/GetContainersStore/GetEndpointsStore";
import { IEndpointRepositoryToken } from "./domain/specifications/IEndpointRepository"
import EndpointsRepository from "./infrastructure/implementations/EndpointRepository";
import GetEndpointsUseCase from "./application/useCases/GetEndpointsUseCase";
@module({
  providers: [
    {
      provide: IEndpointRepositoryToken,
      useClass: EndpointsRepository,
    },
    GetEndpointsUseCase,
    {
      useClass: GetEndpointsStore,
      scope: "Transient",
    },    
  ],
})
export class EndpointModule {}

export const endpointModuleContainer = getModuleContainer(EndpointModule);