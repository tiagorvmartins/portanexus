import ContainerEntity from "../entities/ContainerEntity";
import GetContainersPayload from "../../application/types/GetContainersPayload";
import GetContainersResponse from "../../application/types/GetContainersResponse";
import ControlContainerPayload from "src/containers/application/types/ControlContainerPayload";

export const IContainersRepositoryToken = Symbol("IContainersRepository");

export interface IContainersRepository {
  find: (id: number) => Promise<ContainerEntity>;
  get: (data: GetContainersPayload) => Promise<GetContainersResponse>;
  stop: (data: ControlContainerPayload) => Promise<void>;
  start: (data: ControlContainerPayload) => Promise<void>;
}
