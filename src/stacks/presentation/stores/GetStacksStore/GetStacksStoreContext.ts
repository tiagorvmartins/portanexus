import { createContext } from "react";
import { GetStacksStore } from "./GetStacksStore";

export const GetStacksStoreContext = createContext<GetStacksStore | null>(null);

GetStacksStoreContext.displayName = "GetStacksStoreContext";
