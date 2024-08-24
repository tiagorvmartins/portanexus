import { createContext } from "react";
import { GetTheme } from "./GetTheme";

export const GetThemeContext = createContext<GetTheme | null>(null);
GetThemeContext.displayName = "GetThemeContext";