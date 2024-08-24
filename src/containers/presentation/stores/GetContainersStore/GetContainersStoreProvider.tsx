import { PropsWithChildren } from "react";
import { GetContainersStore } from "./GetContainersStore";
import { GetRunningContainersStoreContext, GetExitedContainersStoreContext, GetStackContainersStoreContext } from "./GetContainersStoreContext";
import { containerModuleContainer } from "src/containers/ContainerModule";


export const GetRunningContainersStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <GetRunningContainersStoreContext.Provider
      value={containerModuleContainer.getProvided(GetContainersStore)}
    >
      {children}
    </GetRunningContainersStoreContext.Provider>
  );
};

export const GetExitedContainersStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <GetExitedContainersStoreContext.Provider
      value={containerModuleContainer.getProvided(GetContainersStore)}
    >
      {children}
    </GetExitedContainersStoreContext.Provider>
  );
};

export const GetStackContainersStoreProvider = ({ children }: PropsWithChildren<any>) => {
  return (
    <GetStackContainersStoreContext.Provider
      value={containerModuleContainer.getProvided(GetContainersStore)}
    >
      {children}
    </GetStackContainersStoreContext.Provider>
  );
};