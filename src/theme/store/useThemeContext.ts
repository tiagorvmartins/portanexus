import { useContextStore } from "src/core/presentation/hooks/useContextStore";
import { GetTheme } from "./GetTheme";
import { GetThemeContext } from "./GetThemeContext";

export const useGetThemeContext = (): GetTheme => {
  const store = useContextStore(GetThemeContext);
  return store;
};
