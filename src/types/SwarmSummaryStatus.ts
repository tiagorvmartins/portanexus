export default interface SwarmSummaryStatus {
  totalNodes: number;
  managers: number;
  workers: number;
  readyNodes: number;
  leader: string;
  managerEngineVersion: string;
  servicesRunning: number;
  servicesTotal: number;
  tasksRunning: number;
  tasksTotal: number;
  stacksTotal: number;
  stacksRunning: number;
}