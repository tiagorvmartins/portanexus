import HttpClient from '../../services/HttpClient';
import StackEntity from "src/features/stacks/StackEntity";
import GetStacksPayload from "src/types/GetStacksPayload";
import GetStacksResponse from "src/types/GetStacksResponse";
import CreateStackPayload from "src/types/CreateStackPayload";
import UpdateStackPayload from "src/types/UpdateStackPayload";

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

export async function deleteStack(stackId: number, endpointId: number): Promise<void> {
    return await HttpClient.Instance.delete(`/api/stacks/${stackId}?endpointId=${endpointId}`);
}

export async function getStackFile(stackId: number): Promise<string> {
    const response = await HttpClient.Instance.get<{ StackFileContent: string }>(`/api/stacks/${stackId}/file`);
    return response.StackFileContent;
}

export async function updateStack(args: UpdateStackPayload): Promise<StackEntity> {
    return await HttpClient.Instance.put<object, StackEntity>(`/api/stacks/${args.stackId}?endpointId=${args.endpointId}`, {
        stackFileContent: args.stackFileContent,
        prune: args.prune ?? false,
        pullImage: args.pullImage ?? false,
        env: [],
    });
}

export async function createStack(args: CreateStackPayload): Promise<StackEntity> {
    const isSwarm = args.swarmId && args.swarmId !== 0 && args.swarmId !== '0';
    if (isSwarm) {
        return await HttpClient.Instance.post<object, StackEntity>(
            `/api/stacks/create/swarm/string?endpointId=${args.endpointId}`,
            { name: args.name, stackFileContent: args.stackFileContent, swarmID: String(args.swarmId), env: [] }
        );
    }
    return await HttpClient.Instance.post<object, StackEntity>(
        `/api/stacks/create/standalone/string?endpointId=${args.endpointId}`,
        { name: args.name, stackFileContent: args.stackFileContent, env: [] }
    );
}

