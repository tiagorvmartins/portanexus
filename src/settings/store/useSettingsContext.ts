import { useContextStore } from "src/core/presentation/hooks/useContextStore";
import { GetSettings } from "./GetSettings";
import { GetSettingsContext } from "./GetSettingsContext";

export const useGetSettingsContext = (): GetSettings => {
  const store = useContextStore(GetSettingsContext);
  return store;
};
