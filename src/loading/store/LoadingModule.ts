import { getModuleContainer, module } from "inversify-sugar";
import { GetLoading } from "./GetLoading";

@module({
  providers: [
    {
      useClass: GetLoading,
      scope: "Transient",
    },
  ],
})
export class LoadingModule {}

export const loadingModuleContainer = getModuleContainer(LoadingModule);
