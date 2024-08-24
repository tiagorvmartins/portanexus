import { PropsWithChildren } from "react";
import { AuthContext } from "./AuthContext";
import { coreModuleContainer } from "src/core/CoreModule";
import { Auth } from "./Auth";


export const AuthProvider = ({ children }: PropsWithChildren) => {
  return (
    <AuthContext.Provider
      value={coreModuleContainer.getProvided(Auth)}
    >
      {children}
    </AuthContext.Provider>
  );
};