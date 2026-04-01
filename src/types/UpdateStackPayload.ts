export default interface UpdateStackPayload {
  stackId: number;
  endpointId: number;
  stackFileContent: string;
  prune?: boolean;
  pullImage?: boolean;
}
