import EndpointEntity from "src/types/EndpointEntity";

export default interface GetEndpointsResponse {
  results: EndpointEntity[];
  count: number;
}
