export interface EndpointSnapshot {
  Swarm?: boolean;
  RunningContainerCount?: number;
  StoppedContainerCount?: number;
  TotalCPU?: number;
  TotalMemory?: number;
  NodeCount?: number;
  ServiceCount?: number;
  StackCount?: number;
}

export default interface EndpointEntity {
  Id?: number;
  Name?: string;
  SwarmId?: string | null;
  IsSwarm: boolean;
  Type?: number;
  URL?: string;
  GroupId?: number;
  PublicURL?: string;
  Status?: 'UP' | 'DOWN';
  Snapshots?: EndpointSnapshot[];
}
