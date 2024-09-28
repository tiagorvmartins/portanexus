import { useContextStore } from "src/core/presentation/hooks/useContextStore";
import { GetLoading } from "./GetLoading";
import { GetLoadingContext } from "./GetLoadingContext";

export const useGetLoadingContext = (): GetLoading => {
  const store = useContextStore(GetLoadingContext);
  return store;
};
