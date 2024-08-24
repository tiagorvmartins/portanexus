import GetEndpointsPayload from "../../application/types/GetEndpointsPayload";
import GetEndpointsResponse from "../../application/types/GetEndpointsResponse";

export const IEndpointRepositoryToken = Symbol("IEndpointRepositoryToken");

export interface IEndpointRepository {  
  get: (data: GetEndpointsPayload) => Promise<GetEndpointsResponse>;
}
