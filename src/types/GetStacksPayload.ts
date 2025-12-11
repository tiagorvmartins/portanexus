export default interface GetStacksPayload {
  filters: {}
  stackId?: number
  endpointId: number
  swarmId: number | string  // SwarmId can be a string (Docker Swarm cluster ID) or number
}
