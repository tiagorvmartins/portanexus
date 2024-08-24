import { getModuleContainer, module } from "inversify-sugar";
import { GetTheme } from "./GetTheme";

@module({
  providers: [
    {
      useClass: GetTheme,
      scope: "Transient",
    },
  ],
})
export class ThemeModule {}

export const themeModuleContainer = getModuleContainer(ThemeModule);
