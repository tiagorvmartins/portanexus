import { createContext } from "react";
import { GetSettings } from "./GetSettings";

export const GetSettingsContext = createContext<GetSettings | null>(null);
GetSettings.displayName = "GetSettingsContext";