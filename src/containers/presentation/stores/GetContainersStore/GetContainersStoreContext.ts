import { createContext } from "react";
import { GetContainersStore } from "./GetContainersStore";

export const GetRunningContainersStoreContext = createContext<GetContainersStore | null>(null);
GetRunningContainersStoreContext.displayName = "GetRunningContainersStoreContext";

export const GetExitedContainersStoreContext = createContext<GetContainersStore | null>(null);
GetExitedContainersStoreContext.displayName = "GetExitedContainersStoreContext";

export const GetStackContainersStoreContext = createContext<GetContainersStore | null>(null);
GetStackContainersStoreContext.displayName = "GetStackContainersStoreContext";



