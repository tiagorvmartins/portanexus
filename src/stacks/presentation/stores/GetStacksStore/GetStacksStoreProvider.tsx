import { PropsWithChildren } from "react";
import { GetStacksStore } from "./GetStacksStore";
import { GetStacksStoreContext } from "./GetStacksStoreContext";
import { stackModuleContainer } from "src/stacks/StackModule";


export const GetStacksStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <GetStacksStoreContext.Provider
      value={stackModuleContainer.getProvided(GetStacksStore)}
    >
      {children}
    </GetStacksStoreContext.Provider>
  );
};
