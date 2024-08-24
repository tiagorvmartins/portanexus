
import { useContextStore } from "src/core/presentation/hooks/useContextStore";
import { GetStacksStore } from "./GetStacksStore";
import { GetStacksStoreContext } from "./GetStacksStoreContext";

export const useGetStacksStore = (): GetStacksStore => {
  const store = useContextStore(GetStacksStoreContext);

  return store;
};
