import { createContext } from "react";
import { Auth } from "./Auth";
export const AuthContext = createContext<Auth | null>(null);
AuthContext.displayName = "AuthContext";
