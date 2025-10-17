import { plainToInstance } from "class-transformer";
import HttpClient from '../../services/HttpClient';
import GetSwarmStatusResponse from "./GetSwarmResponse";
import GetSwarmServicesResponse from "./GetSwarmServicesResponse";
import GetSwarmTasksResponse from "./GetSwarmTasksResponse";
import GetSwarmPayload from "./GetSwarmPayload";

export async function getSwarmStatus(payload: GetSwarmPayload): Promise<GetSwarmStatusResponse> {
    const filters = encodeURIComponent(JSON.stringify({ SwarmID: payload.swarmId}))
    const [swarmNodes, servicesRes, tasksRes, stacksRes] = await Promise.all([
          HttpClient.Instance.get<unknown[]>(`/api/endpoints/${payload.endpointId}/docker/nodes`),
          HttpClient.Instance.get<unknown[]>(`/api/endpoints/${payload.endpointId}/docker/services`),
          HttpClient.Instance.get<unknown[]>(`/api/endpoints/${payload.endpointId}/docker/tasks`),
          HttpClient.Instance.get<unknown[]>(`/api/stacks?filters=${filters}`)
    ]);

    const managers = swarmNodes.filter(n => n.Spec.Role === "manager");
    const workers = swarmNodes.filter(n => n.Spec.Role === "worker");

    const leader = managers.find(n => n.ManagerStatus?.Leader);
    const allReady = swarmNodes.every(n => n.Status.State === "ready" && n.Spec.Availability === "active");
    const allReachable = managers.every(n => n.ManagerStatus?.Reachability === "reachable");

    const totalServices = servicesRes.length;
    const runningServicesSet = new Set<string>();

    for (const task of tasksRes) {
      if (task.Status?.State === "running") {
        runningServicesSet.add(task.ServiceID);
      }
    }

    const totalTasks = tasksRes.length;
    const runningTasks = tasksRes.filter((t: any) => t.Status?.State === "running").length;

    const runningServices = runningServicesSet.size;

    const totalStacks = stacksRes.length;
    const runningStacks = stacksRes.filter((s: any) => s.Status === 1).length;

    return {
      healthy: !!leader && allReady && allReachable,
      summary: {
        totalNodes: swarmNodes.length,
        managers: managers.length,
        workers: workers.length,
        readyNodes: swarmNodes.filter(n => n.Status.State === "ready").length,
        leader: leader?.Description?.Hostname || "none",
        managerEngineVersion: leader?.Description?.Engine?.EngineVersion || "none",
        servicesRunning: runningServices,
        servicesTotal: totalServices,
        tasksRunning: runningTasks,
        tasksTotal: totalTasks,
        stacksTotal: totalStacks,
        stacksRunning: runningStacks
      }
    };
}

export async function getSwarmServices(payload: GetSwarmPayload): Promise<GetSwarmServicesResponse> {
    try {
        const swarmServices = await HttpClient.Instance.get<unknown[]>(`/api/endpoints/${payload.endpointId}/docker/services`);
        const response: GetSwarmServicesResponse = {
            results: swarmServices,
            count: swarmServices.length,
        };
        return response;
    } catch {
        return {
            results: [],
            count: 0
        }
    }

}

export async function getSwarmTasks(payload: GetSwarmPayload): Promise<GetSwarmTasksResponse> {
    try {
        let filters;
        if (payload.serviceName)
            filters = encodeURIComponent(JSON.stringify({service: payload.serviceName}))
        else
            filters = encodeURIComponent(JSON.stringify({}))

        const swarmTasks = await HttpClient.Instance.get<unknown[]>(`/api/endpoints/${payload.endpointId}/docker/tasks?filters=${filters}`);
        const response: GetSwarmTasksResponse = {
            results: swarmTasks,
            count: swarmTasks.length,
        };
        return response;
    } catch {
        return {
            results: [],
            count: 0
        }
    }
}
