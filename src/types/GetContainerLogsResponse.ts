export interface Log {
  id: string;
  text: string;
}

export default interface GetContainerLogsResponse {
  containerId: string;
  results: Log[];
  count: number;
}
