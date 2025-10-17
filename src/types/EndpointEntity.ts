export default interface EndpointEntity {
  Id?: number;
  Name?: string;
  SwarmId: string;
  IsSwarm: boolean;
  Type?: number;
  URL?: string;
  GroupId?: number;
  PublicURL?: string;
}
