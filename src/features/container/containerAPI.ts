import { plainToInstance } from "class-transformer";
import HttpClient from '../../services/HttpClient';
import uuid from 'react-native-uuid'
import ContainerDto from "./ContainerDto";
import GetContainersPayload from "src/types/GetContainersPayload";
import GetContainersResponse from "src/types/GetContainersResponse";
import ControlContainerPayload from "src/types/ControlContainerPayload";
import GetContainerStatsPayload from "src/types/GetStatsPayload";
import GetContainerStatsResponse, { Stats } from "src/types/GetContainerStatsResponse";
import GetContainerLogsPayload from "src/types/GetContainerLogsPayload";
import GetContainerLogsResponse from "src/types/GetContainerLogsResponse";

export async function get(payload: GetContainersPayload): Promise<GetContainersResponse> {
    try {
        const filters = encodeURIComponent(JSON.stringify(payload.filters))
        const containers = (await HttpClient.Instance.get<unknown[]>(`/api/endpoints/${payload.endpointId}/docker/containers/json?all=true&filters=${filters}`));
        const response: GetContainersResponse = {
            results: containers.map((container: any) => plainToInstance(ContainerDto, container).toDomain()),
            count: containers.length,
        };
        return response;
    } catch {
        return {
            results: [],
            count: 0
        }
    }
}

export async function start(data: ControlContainerPayload): Promise<void> {
    return await HttpClient.Instance.post(`/api/endpoints/${data.endpointId}/docker/containers/${data.containerId}/start`);
}

export async function stop(data: ControlContainerPayload): Promise<void> {
    return await HttpClient.Instance.post(`/api/endpoints/${data.endpointId}/docker/containers/${data.containerId}/stop`);
}

export async function getContainerStats(data: GetContainerStatsPayload): Promise<GetContainerStatsResponse> {
    try {
        const stats = await HttpClient.Instance.get<any>(`/api/endpoints/${data.endpointId}/docker/containers/${data.containerId}/stats?stream=false&one-shot=false`);
        const usedMemoryCgroup1 = stats.memory_stats.stats.total_inactive_file && stats.memory_stats.stats.total_inactive_file < stats.memory_stats.usage ? stats.memory_stats.usage - stats.memory_stats.stats.total_inactive_file : 0;
        const usedMemoryCgroup2 = stats.memory_stats.stats.inactive_file && stats.memory_stats.stats.inactive_file < stats.memory_stats.usage ? stats.memory_stats.usage - stats.memory_stats.stats.inactive_file : 0;
        let usedMemory = stats.memory_stats.usage;

        if (stats.memory_stats.stats.total_inactive_file)
            usedMemory = usedMemoryCgroup1;

        if (stats.memory_stats.stats.inactive_file)
            usedMemory = usedMemoryCgroup2;

        const availableMemory = stats.memory_stats.limit;
        const memoryUsagePercentage = (usedMemory / availableMemory) * 100.0;

        const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
        const systemCpuDelta = stats.cpu_stats.system_cpu_usage - (stats.precpu_stats.system_cpu_usage ?? 0);
        const numberCpus = stats.cpu_stats.online_cpus;
        const cpuUsagePercentage = (cpuDelta / systemCpuDelta) * numberCpus * 100.0;

        const memoryUsageStat: Stats = {
            label: "MEM %",
            value: memoryUsagePercentage.toFixed(2)
        }
        const cpuUsageStat: Stats = {
            label: "CPU %",
            value: cpuUsagePercentage.toFixed(2)
        }

        const containerStats: Stats[] = [memoryUsageStat, cpuUsageStat];

        const response: GetContainerStatsResponse = {
            results: containerStats,
            count: containerStats.length,
        };
        return response;

    } catch {
        return {
            results: [],
            count: 0
        }
    }
}

export async function getContainerLogs(data: GetContainerLogsPayload): Promise<GetContainerLogsResponse> {
    try {
        const arrayBuffer = await HttpClient.Instance.get(`/api/endpoints/${data.endpointId}/docker/containers/${data.containerId}/logs?stdout=true&stderr=true&since=${data.since}&until=${data.until}`,
            {
                responseType: "arraybuffer"
            }) as ArrayBuffer;
        
        let buffer = new Uint8Array(arrayBuffer);
        let cleanedLogs = processLogsBuffer(buffer);
        return {
            containerId: data.containerId,
            results: cleanedLogs,
            count: cleanedLogs.length
        }

    } catch (e) {
        return {
            containerId: data.containerId,
            results: [],
            count: 0
        }
    }
}

function processLogsBuffer(buffer: Uint8Array) {
  let logs = [];
  let currentPosition = 0;
  const decoder = new TextDecoder('utf-8');

  while (currentPosition + 8 <= buffer.length) {
    const header = buffer.subarray(currentPosition, currentPosition + 8);
    const frameSize = (
      (header[4] << 24) |
      (header[5] << 16) |
      (header[6] << 8) |
      header[7]
    );

    const logDataStart = currentPosition + 8;
    const logDataEnd = logDataStart + frameSize;

    if (logDataEnd > buffer.length) break;

    const logContent = buffer.subarray(logDataStart, logDataEnd);
    const logText = decoder.decode(logContent);

    logs.push({ id: uuid.v4(), text: logText });
    currentPosition = logDataEnd;
  }

  return logs;
}
