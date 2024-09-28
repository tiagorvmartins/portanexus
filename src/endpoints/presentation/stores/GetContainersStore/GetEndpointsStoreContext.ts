import { createContext } from "react";
import { GetEndpointsStore } from "./GetEndpointsStore";

export const GetEndpointsStoreContext = createContext<GetEndpointsStore | null>(null);
GetEndpointsStoreContext.displayName = "GetEndpoints";



