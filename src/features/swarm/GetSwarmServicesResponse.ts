import ServiceEntity from "src/types/ServiceEntity";

export default interface GetSwarmServicesResponse {
  results: ServiceEntity[];
  count: number;
}