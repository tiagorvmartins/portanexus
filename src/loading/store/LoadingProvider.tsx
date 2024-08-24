import { PropsWithChildren } from "react";
import { GetLoading } from "./GetLoading";
import { GetLoadingContext } from "./GetLoadingContext";
import { loadingModuleContainer } from "./LoadingModule";

export const GetLoadingProvider = ({ children }: PropsWithChildren) => {
  return (
    <GetLoadingContext.Provider
      value={loadingModuleContainer.getProvided(GetLoading)}
    >
      {children}
    </GetLoadingContext.Provider>
  );
};
