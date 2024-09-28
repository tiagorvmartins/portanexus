
import { useContextStore } from "src/core/presentation/hooks/useContextStore";
import { GetContainersStore } from "./GetContainersStore";
import { GetRunningContainersStoreContext, GetExitedContainersStoreContext, GetStackContainersStoreContext, GetAllContainersStoreContext, GetSingleContainersStoreContext } from "./GetContainersStoreContext";

export const useGetRunningContainersStore = (): GetContainersStore => {
  const store = useContextStore(GetRunningContainersStoreContext);
  return store;
};

export const useGetExitedContainersStore = (): GetContainersStore => {
  const store = useContextStore(GetExitedContainersStoreContext);
  return store;
};

export const useGetStackContainersStore = (): GetContainersStore => {
  const store = useContextStore(GetStackContainersStoreContext);
  return store;
};

export const useGetAllContainersStore = (): GetContainersStore => {
  const store = useContextStore(GetAllContainersStoreContext);
  return store;
};

export const useGetSingleContainersStore = (): GetContainersStore => {
  const store = useContextStore(GetSingleContainersStoreContext);
  return store;
};
