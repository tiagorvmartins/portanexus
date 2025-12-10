import { plainToInstance } from "class-transformer";
import HttpClient from '../../services/HttpClient';
import GetEndpointsResponse from "./GetEndpointsResponse";

export async function get(): Promise<GetEndpointsResponse> {
  const endpoints = await HttpClient.Instance.get<unknown[]>('/api/endpoints');
  const response: GetEndpointsResponse = {
    results: await Promise.all(endpoints.map(async (endpoint: any) => {
      const endpointId = Number(endpoint.Id);
      const isSwarm = endpoint.Snapshots[0]?.Swarm ?? false;
      let swarmId = null;
      let status: 'UP' | 'DOWN' = 'UP';

      if (isSwarm) {
        try {
          const swarmResponse = await HttpClient.Instance.get(`/api/endpoints/${endpoint.Id}/docker/swarm`);
          swarmId = swarmResponse?.ID ?? null;
          status = swarmId ? 'UP' : 'DOWN';
        } catch (error) {
          // Log as warning to avoid red-screening on mobile while keeping visibility.
          console.warn(`Failed to fetch Swarm ID for endpoint ${endpoint.Id}:`, error);
          status = 'DOWN';
        }
      }
      return {
        ...endpoint,
        Id: isNaN(endpointId) ? endpoint.Id : endpointId,
        IsSwarm: isSwarm,
        SwarmId: swarmId,
        Status: status,
      };
    })),
    count: endpoints.length,
  };

  return response;
}
