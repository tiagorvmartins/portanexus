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
}
