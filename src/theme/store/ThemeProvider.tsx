import { PropsWithChildren } from "react";
import { GetTheme } from "./GetTheme";
import { GetThemeContext } from "./GetThemeContext";
import { themeModuleContainer } from "./ThemeModule";

export const GetThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <GetThemeContext.Provider
      value={themeModuleContainer.getProvided(GetTheme)}
    >
      {children}
    </GetThemeContext.Provider>
  );
};
