import { createContext } from "react";
import { GetLoading } from "./GetLoading";

export const GetLoadingContext = createContext<GetLoading | null>(null);
GetLoadingContext.displayName = "GetLoadingContext";