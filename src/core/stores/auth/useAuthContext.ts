
import { useContextStore } from "src/core/presentation/hooks/useContextStore";
import { AuthContext } from "./AuthContext";
import { Auth } from "./Auth";

export const useAuthContext = (): Auth => {
  const store = useContextStore(AuthContext);
  return store;
};