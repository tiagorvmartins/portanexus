import StackEntity from "../entities/StackEntity";
import GetStacksResponse from "../../application/types/GetStacksResponse";
import GetStacksPayload from "src/stacks/application/types/GetStacksPayload";

export const IStacksRepositoryToken = Symbol("IStacksRepository");

export interface IStacksRepository {
  find: (id: number) => Promise<StackEntity>;
  get: (data: GetStacksPayload) => Promise<GetStacksResponse>;
  stop: (id: number) => Promise<void>;
  start: (id: number) => Promise<void>;
}
