import { getModuleContainer, module } from "inversify-sugar";
import { GetSettings } from "./GetSettings";

@module({
  providers: [
    {
      useClass: GetSettings,
      scope: "Transient",
    },
  ],
})
export class SettingsModule {}

export const settingsModuleContainer = getModuleContainer(SettingsModule);
