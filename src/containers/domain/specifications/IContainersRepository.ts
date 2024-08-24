import ContainerEntity from "../entities/ContainerEntity";
import GetContainersPayload from "../../application/types/GetContainersPayload";
import GetContainersResponse from "../../application/types/GetContainersResponse";

export const IContainersRepositoryToken = Symbol("IContainersRepository");

export interface IContainersRepository {
  find: (id: number) => Promise<ContainerEntity>;
  get: (data: GetContainersPayload) => Promise<GetContainersResponse>;
}
