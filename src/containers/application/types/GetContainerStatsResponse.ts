export interface Stats {
  label: string;
  value: string;
}

export default interface GetContainerStatsResponse {
  results: Stats[];
  count: number;
}
