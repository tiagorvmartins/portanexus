import { plainToInstance } from "class-transformer";
import HttpClient from '../../services/HttpClient';
import EndpointDto from "./EndpointDto";
import GetEndpointsResponse from "./GetEndpointsResponse";

export async function get(): Promise<GetEndpointsResponse> {
    // Not using try catch, such that exception can be caught up in the stack
    const endpoints = (await HttpClient.Instance.get<unknown[]>(`/api/endpoints`));
    const response: GetEndpointsResponse = {
            results: endpoints.map((endpoint: any) => plainToInstance(EndpointDto, endpoint).toDomain()),
            count: endpoints.length,
    };
    return response;
    
}
