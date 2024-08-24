import EndpointEntity from "src/endpoints/domain/entities/EndpointEntity";

export default interface GetEndpointsResponse {
  results: EndpointEntity[];
  count: number;
}
