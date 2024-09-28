import ContainerEntity from "../entities/ContainerEntity";
import GetContainersPayload from "../../application/types/GetContainersPayload";
import GetContainersResponse from "../../application/types/GetContainersResponse";
import ControlContainerPayload from "src/containers/application/types/ControlContainerPayload";
import GetContainerLogsPayload from "src/containers/application/types/GetLogsPayload";
import GetContainerLogsResponse from "src/containers/application/types/GetContainerLogsResponse";

export const IContainersRepositoryToken = Symbol("IContainersRepository");

export interface IContainersRepository {
  find: (id: number) => Promise<ContainerEntity>;
  get: (data: GetContainersPayload) => Promise<GetContainersResponse>;
  stop: (data: ControlContainerPayload) => Promise<void>;
  start: (data: ControlContainerPayload) => Promise<void>;
  getContainerLogs(data: GetContainerLogsPayload): Promise<GetContainerLogsResponse>
}
