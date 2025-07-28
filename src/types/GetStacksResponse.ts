import StackEntity from "../../domain/entities/StackEntity";

export default interface GetStacksResponse {
  results: StackEntity[];
  count: number;
}
