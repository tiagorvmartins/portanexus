export default interface GetContainerLogsPayload {
    endpointId: number,
    containerId: string,
    since: number
    until: number
}