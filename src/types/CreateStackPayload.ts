export default interface CreateStackPayload {
  name: string;
  stackFileContent: string;
  endpointId: number;
  swarmId?: string | number;
}
