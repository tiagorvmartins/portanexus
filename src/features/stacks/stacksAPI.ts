import HttpClient from '../../services/HttpClient';
import StackEntity from "src/features/stacks/StackEntity";
import GetStacksPayload from "src/types/GetStacksPayload";
import GetStacksResponse from "src/types/GetStacksResponse";

export async function find(id: number): Promise<StackEntity> {
    try {
        return await HttpClient.Instance.get<StackEntity>(`/api/stacks/${id}`);
    } catch {
        return {} as StackEntity
    }
}

export async function get(payload: GetStacksPayload): Promise<GetStacksResponse> {
    try {
        let filters;
        // Use SwarmID filter if swarmId is provided and not 0 or empty string
        // SwarmID is a Docker Swarm cluster ID (string hash like "z80kkn8yyirf9oage1hleqn7o")
        if (payload.swarmId && payload.swarmId !== 0 && payload.swarmId !== '0' && payload.swarmId !== '') {
            // Convert to string (handles both string and number inputs)
            const swarmIdValue = String(payload.swarmId);
            filters = encodeURIComponent(JSON.stringify({...payload.filters, SwarmID: swarmIdValue}))
        } else {
            // For non-swarm endpoints, filter by EndpointID
            filters = encodeURIComponent(JSON.stringify({...payload.filters, EndpointID: payload.endpointId}))
        }

        const stacks = (await HttpClient.Instance.get<StackEntity[]>(`/api/stacks?filters=${filters}`));
        const response: GetStacksResponse = {
            results: stacks.map((stack: any) => ({...stack})),
            count: stacks.length,
        };
        return response;
    } catch (error) {
        console.error("Error fetching stacks:", error);
        return {
            results: [],
            count: 0
        }
    }
}

export async function start(args: GetStacksPayload): Promise<void> {
    return await HttpClient.Instance.post(`/api/stacks/${args.stackId}/start?endpointId=${args.endpointId}`);
}

export async function stop(args: GetStacksPayload): Promise<void> {
    return await HttpClient.Instance.post(`/api/stacks/${args.stackId}/stop?endpointId=${args.endpointId}`);
}

