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
        const filters = encodeURIComponent(JSON.stringify(payload.filters))
        const stacks = (await HttpClient.Instance.get<StackEntity[]>(`/api/stacks?filters=${filters}`));
        const response: GetStacksResponse = {
            results: stacks.map((stack: any) => ({...stack})),
            count: stacks.length,
        };
        return response;
    } catch {
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

