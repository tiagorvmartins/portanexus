import { injectable, provided } from "inversify-sugar";
import { IContainersRepository } from "../../domain/specifications/IContainersRepository";
import ContainerDto from "../models/ContainerDto";
import GetContainersResponse from "../../application/types/GetContainersResponse";
import GetContainersPayload from "../../application/types/GetContainersPayload";
import { plainToInstance } from "class-transformer";
import IHttpClient, { IHttpClientToken } from "src/core/domain/specifications/IHttpAxiosConnector";
import ContainerEntity from "src/containers/domain/entities/ContainerEntity";
import ControlContainerPayload from "src/containers/application/types/ControlContainerPayload";
import GetContainerLogsPayload from "src/containers/application/types/GetLogsPayload";
import GetContainerLogsResponse from "src/containers/application/types/GetContainerLogsResponse";
import { Buffer } from 'buffer';
import uuid from 'react-native-uuid'
import GetContainerStatsPayload from "src/containers/application/types/GetStatsPayload";
import GetContainerStatsResponse, { Stats } from "src/containers/application/types/GetContainerStatsResponse";

@injectable()
class ContainersRepository implements IContainersRepository {
  private readonly endpointsBaseUrl = "/endpoints";

  constructor(
    @provided(IHttpClientToken) private readonly httpClient: IHttpClient
  ) {}

  public async find(id: number): Promise<ContainerEntity> {
    try {
      const response = await this.httpClient.get<unknown>(`${this.endpointsBaseUrl}/${id}`);
      const responseDto = plainToInstance(ContainerDto, response);
      return responseDto.toDomain();
    } catch {
      return {} as ContainerEntity
    }
  }

  public async get(payload: GetContainersPayload): Promise<GetContainersResponse> {
    try {
      const filters = encodeURIComponent(JSON.stringify(payload.filters))
      const stacks = (await this.httpClient.get<unknown[]>(`${this.endpointsBaseUrl}/${payload.endpointId}/docker/containers/json?all=true&filters=${filters}`));
      const response: GetContainersResponse = {
        results: stacks.map((container: any) => plainToInstance(ContainerDto, container).toDomain()),
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

  public async start(data: ControlContainerPayload): Promise<void> {
    return await this.httpClient.post(`${this.endpointsBaseUrl}/${data.endpointId}/docker/containers/${data.containerId}/start`);
  }

  public async stop(data: ControlContainerPayload): Promise<void> {
    return await this.httpClient.post(`${this.endpointsBaseUrl}/${data.endpointId}/docker/containers/${data.containerId}/stop`);
  }

  public async getContainerStats(data: GetContainerStatsPayload): Promise<GetContainerStatsResponse> {
    try {
      const stats = await this.httpClient.get<any>(`${this.endpointsBaseUrl}/${data.endpointId}/docker/containers/${data.containerId}/stats?stream=false&one-shot=false`);
      const usedMemoryCgroup1 = stats.memory_stats.stats.total_inactive_file && stats.memory_stats.stats.total_inactive_file < stats.memory_stats.usage ? stats.memory_stats.usage - stats.memory_stats.stats.total_inactive_file : 0;
      const usedMemoryCgroup2 = stats.memory_stats.stats.inactive_file && stats.memory_stats.stats.inactive_file < stats.memory_stats.usage ? stats.memory_stats.usage - stats.memory_stats.stats.inactive_file : 0;
      let usedMemory = stats.memory_stats.usage;

      if (stats.memory_stats.stats.total_inactive_file)
        usedMemory = usedMemoryCgroup1;

      if (stats.memory_stats.stats.inactive_file)
        usedMemory = usedMemoryCgroup2;

      const availableMemory = stats.memory_stats.limit;
      const memoryUsagePercentage = (usedMemory/availableMemory) * 100.0;

      const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
      const systemCpuDelta  = stats.cpu_stats.system_cpu_usage - (stats.precpu_stats.system_cpu_usage ?? 0);
      const numberCpus  = stats.cpu_stats.online_cpus;
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

  public async getContainerLogs(data: GetContainerLogsPayload): Promise<GetContainerLogsResponse> {
    try {
      const arrayBuffer = await this.httpClient.get(`${this.endpointsBaseUrl}/${data.endpointId}/docker/containers/${data.containerId}/logs?stdout=true&stderr=true&since=${data.since}&until=${data.until}`, 
      {
        responseType: "arraybuffer"
      }) as ArrayBuffer;

      let buffer = new Uint8Array(arrayBuffer);
      let cleanedLogs = this.processLogsBuffer(buffer);
      
      return {
        results: cleanedLogs,
        count: cleanedLogs.length
      }

    } catch {
      return {
        results: [],
        count: 0
      }
    }
  }

  private processLogsBuffer(buffer: Uint8Array) {
    let logs = [];
    let currentPosition = 0;
    
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
        const logText = Buffer.from(logContent).toString('utf-8');

        logs.push({ id: uuid.v4() as string, text: logText});
        currentPosition = logDataEnd;
    }

    return logs;
  }
}

export default ContainersRepository;
