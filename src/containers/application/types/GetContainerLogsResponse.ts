export interface Log {
  id: string;
  text: string;
}

export default interface GetContainerLogsResponse {
  results: Log[];
  count: number;
}
