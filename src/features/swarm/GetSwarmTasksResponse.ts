import TaskEntity from "src/types/TaskEntity";

export default interface GetSwarmTasksResponse {
  results: TaskEntity[];
  count: number;
}