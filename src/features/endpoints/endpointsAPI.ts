import { plainToInstance } from "class-transformer";
import HttpClient from '../../services/HttpClient';
import GetEndpointsResponse from "./GetEndpointsResponse";

export async function get(): Promise<GetEndpointsResponse> {
  const endpoints = await HttpClient.Instance.get<unknown[]>('/api/endpoints');
  const response: GetEndpointsResponse = {
    results: await Promise.all(endpoints.map(async (endpoint: any) => {
      const isSwarm = endpoint.Snapshots[0]?.Swarm ?? false;
      let swarmId = null;

      if (isSwarm) {
        try {
          const swarmResponse = await HttpClient.Instance.get(`/api/endpoints/${endpoint.Id}/docker/swarm`);
          swarmId = swarmResponse?.ID ?? null;
        } catch (error) {
          console.error(`Failed to fetch Swarm ID for endpoint ${endpoint.Id}:`, error);
        }
      }
      return {
        ...endpoint,
        IsSwarm: isSwarm,
        SwarmId: swarmId,
      };
    })),
    count: endpoints.length,
  };

  return response;
}
