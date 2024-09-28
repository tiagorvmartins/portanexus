
import { useContextStore } from "src/core/presentation/hooks/useContextStore";
import { GetEndpointsStore } from "./GetEndpointsStore";
import { GetEndpointsStoreContext } from "./GetEndpointsStoreContext";

export const useGetEndpointsStore = (): GetEndpointsStore => {
  const store = useContextStore(GetEndpointsStoreContext);
  return store;
};