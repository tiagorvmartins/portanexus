import ContainerEntity from "src/containers/domain/entities/ContainerEntity";

export default interface GetContainersResponse {
  results: ContainerEntity[];
  count: number;
}
