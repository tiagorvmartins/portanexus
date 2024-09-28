import { PropsWithChildren } from "react";
import { GetSettings } from "./GetSettings";
import { GetSettingsContext } from "./GetSettingsContext";
import { settingsModuleContainer } from "./SettingsModule";

export const GetSettingsProvider = ({ children }: PropsWithChildren) => {
  return (
    <GetSettingsContext.Provider
      value={settingsModuleContainer.getProvided(GetSettings)}
    >
      {children}
    </GetSettingsContext.Provider>
  );
};
