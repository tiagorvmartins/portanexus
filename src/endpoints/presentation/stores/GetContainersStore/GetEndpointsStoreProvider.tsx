import { PropsWithChildren } from "react";
import { GetEndpointsStore } from "./GetEndpointsStore";
import { GetEndpointsStoreContext } from "./GetEndpointsStoreContext";
import { endpointModuleContainer } from "src/endpoints/EndpointModule";


export const GetEndpointsStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <GetEndpointsStoreContext.Provider
      value={endpointModuleContainer.getProvided(GetEndpointsStore)}
    >
      {children}
    </GetEndpointsStoreContext.Provider>
  );
};