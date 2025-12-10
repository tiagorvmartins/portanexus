import HttpClient from '../../services/HttpClient';
import GetSwarmStatusResponse from "./GetSwarmResponse";
import GetSwarmServicesResponse from "./GetSwarmServicesResponse";
import GetSwarmTasksResponse from "./GetSwarmTasksResponse";
import GetSwarmPayload from "./GetSwarmPayload"; 

export async function getSwarmEvents(payload: GetSwarmPayload): Promise<any[]> {
    // Don't attempt to fetch events if swarmId is invalid
    const swarmIdStr = String(payload.swarmId || '0');
    if (!payload.swarmId || swarmIdStr === '0') {
        return [];
    }
    // Get events from the last hour up to now
    const until = Math.floor(Date.now() / 1000);
    const since = until - 3600;
    const url = `/api/endpoints/${payload.endpointId}/docker/events?since=${since}&until=${until}`;
    const response = await HttpClient.Instance.get(url);
    if (!response) {
        return [];
    }

    if (Array.isArray(response)) {
        return response;
    } else if (typeof response === 'object') {
        return [response];
    }

    if (typeof response === 'string' && response.includes('\n')) {
        // If it's a single object, parse directly
        const trimmed = response.trim();
        // Otherwise, split multiple objects
        const objects = trimmed.replace(/}\s*{/g, '}|{')
            .split('|')
            .map(str => {
                try {
                    return JSON.parse(str);
                } catch (e) {
                    return null;
                }
            })
            .filter(Boolean);
        return objects;
    }
    // If response is neither array nor string, return empty array
    return [];
    
}

export async function getSwarmStatus(payload: GetSwarmPayload): Promise<GetSwarmStatusResponse> {
    // Don't attempt to fetch swarm status if swarmId is invalid
    const swarmIdStr = String(payload.swarmId || '0');
    if (!payload.swarmId || swarmIdStr === '0') {
        return {
            healthy: false,
            summary: {
                totalNodes: 0,
                managers: 0,
                workers: 0,
                readyNodes: 0,
                leader: "none",
                managerEngineVersion: "none",
                servicesRunning: 0,
                servicesTotal: 0,
                tasksRunning: 0,
                tasksTotal: 0,
                stacksTotal: 0,
                stacksRunning: 0
            }
        };
    }
    
    const filters = encodeURIComponent(JSON.stringify({ SwarmID: swarmIdStr}))
    const [swarmNodes, servicesRes, tasksRes, stacksRes] = await Promise.all([
          HttpClient.Instance.get<any[]>(`/api/endpoints/${payload.endpointId}/docker/nodes`),
          HttpClient.Instance.get<any[]>(`/api/endpoints/${payload.endpointId}/docker/services`),
          HttpClient.Instance.get<any[]>(`/api/endpoints/${payload.endpointId}/docker/tasks`),
          HttpClient.Instance.get<any[]>(`/api/stacks?filters=${filters}`)
    ]);

    const managers = swarmNodes.filter((n: any) => n.Spec?.Role === "manager");
    const workers = swarmNodes.filter((n: any) => n.Spec?.Role === "worker");

    const leader = managers.find((n: any) => n.ManagerStatus?.Leader);
    const allReady = swarmNodes.every((n: any) => n.Status?.State === "ready" && n.Spec?.Availability === "active");
    const allReachable = managers.every((n: any) => n.ManagerStatus?.Reachability === "reachable");

    const totalServices = servicesRes.length;
    const runningServicesSet = new Set<string>();

    for (const task of tasksRes as any[]) {
      if (task.Status?.State === "running") {
        runningServicesSet.add(task.ServiceID);
      }
    }

    const totalTasks = tasksRes.length;
    const runningTasks = (tasksRes as any[]).filter((t: any) => t.Status?.State === "running").length;

    const runningServices = runningServicesSet.size;

    const totalStacks = stacksRes.length;
    const runningStacks = (stacksRes as any[]).filter((s: any) => s.Status === 1).length;

    return {
      healthy: !!leader && allReady && allReachable,
      summary: {
        totalNodes: swarmNodes.length,
        managers: managers.length,
        workers: workers.length,
        readyNodes: swarmNodes.filter((n: any) => n.Status?.State === "ready" && n.Spec?.Availability === "active").length,
        leader: (leader as any)?.Description?.Hostname || "none",
        managerEngineVersion: (leader as any)?.Description?.Engine?.EngineVersion || "none",
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
        // Don't attempt to fetch services if swarmId is invalid
        const swarmIdStr = String(payload.swarmId || '0');
        if (!payload.swarmId || swarmIdStr === '0') {
            return {
                results: [],
                count: 0
            };
        }
        try {
            const swarmServices = await HttpClient.Instance.get<any[]>(`/api/endpoints/${payload.endpointId}/docker/services`);
            const response: GetSwarmServicesResponse = {
                results: swarmServices || [],
                count: swarmServices?.length || 0,
            };
            return response;
        } catch (error: any) {
            console.error("Error fetching swarm services:", error);
            throw error; // Re-throw to let the caller handle it
        }
    }

export async function updateServiceScale(
    payload: GetSwarmPayload & { serviceId: string; replicas: number }
): Promise<void> {
    if (!payload.serviceId) {
        throw new Error("Service ID is required to update service scale");
    }
    
    const shortServiceId = payload.serviceId.length > 12 ? payload.serviceId.substring(0, 12) : payload.serviceId;
    
    // First, get the current service spec to preserve all other fields
    try {
        const service = await HttpClient.Instance.get<any>(`/api/endpoints/${payload.endpointId}/docker/services/${shortServiceId}`);
        const version = service.Version?.Index;
        
        if (!version) {
            throw new Error("Could not determine service version. Please refresh and try again.");
        }
        
        // Build update body - Docker API expects the full Spec structure
        // Only change Mode.Replicated.Replicas
        const updateBody: any = {
            Name: service.Spec?.Name || "",
            Labels: service.Spec?.Labels || {},
            TaskTemplate: service.Spec?.TaskTemplate || {},
            Mode: {
                Replicated: {
                    Replicas: payload.replicas
                }
            },
            UpdateConfig: service.Spec?.UpdateConfig || {},
            RollbackConfig: service.Spec?.RollbackConfig || {},
            Networks: service.Spec?.Networks || [],
            EndpointSpec: service.Spec?.EndpointSpec || {},
        };
        
        // Update service using POST to /services/{id}/update with version parameter
        const url = `/api/endpoints/${payload.endpointId}/docker/services/${shortServiceId}/update?version=${version}`;
        
        await HttpClient.Instance.post(url, updateBody);
    } catch (error: any) {
        console.error("Failed to update service scale:", error);
        throw new Error(`Failed to update service scale: ${error.response?.data?.message || error.message || "Unknown error"}`);
    }
}

export async function recreateService(
    payload: GetSwarmPayload & { serviceId: string }
): Promise<void> {
    if (!payload.serviceId) {
        throw new Error("Service ID is required to recreate a service");
    }
    
    const shortServiceId = payload.serviceId.length > 12 ? payload.serviceId.substring(0, 12) : payload.serviceId;
    
    try {
        // Get the current service spec
        const service = await HttpClient.Instance.get<any>(`/api/endpoints/${payload.endpointId}/docker/services/${shortServiceId}`);
        const version = service.Version?.Index;
        
        if (!version) {
            throw new Error("Could not determine service version. Please refresh and try again.");
        }
        
        // Build update body with the same spec but add ForceUpdate to trigger recreation
        // ForceUpdate increments a counter that forces Docker to recreate all tasks
        const currentSpec = service.Spec || {};
        const currentTaskTemplate = currentSpec.TaskTemplate || {};
        
        // Increment ForceUpdate counter or set to 1 if it doesn't exist
        const forceUpdate = (currentTaskTemplate.ForceUpdate || 0) + 1;
        
        const updateBody: any = {
            Name: currentSpec.Name || "",
            Labels: currentSpec.Labels || {},
            TaskTemplate: {
                ...currentTaskTemplate,
                ForceUpdate: forceUpdate
            },
            Mode: currentSpec.Mode || {},
            UpdateConfig: currentSpec.UpdateConfig || {},
            RollbackConfig: currentSpec.RollbackConfig || {},
            Networks: currentSpec.Networks || [],
            EndpointSpec: currentSpec.EndpointSpec || {},
        };
        
        // Update service using POST to /services/{id}/update with version parameter
        const url = `/api/endpoints/${payload.endpointId}/docker/services/${shortServiceId}/update?version=${version}`;
        
        await HttpClient.Instance.post(url, updateBody);
    } catch (error: any) {
        console.error("Failed to recreate service:", error);
        throw new Error(`Failed to recreate service: ${error.response?.data?.message || error.message || "Unknown error"}`);
    }
}

export async function getSwarmTasks(payload: GetSwarmPayload): Promise<GetSwarmTasksResponse> {
        // Don't attempt to fetch tasks if swarmId is invalid
        const swarmIdStr = String(payload.swarmId || '0');
        if (!payload.swarmId || swarmIdStr === '0') {
            return {
                results: [],
                count: 0,
            };
        }
        try {
            let url = `/api/endpoints/${payload.endpointId}/docker/tasks`;
            
            // Only add filters if serviceName is provided
            // Filter format: {"service":["serviceName"]}
            if (payload.serviceName) {
                const filters = encodeURIComponent(JSON.stringify({service: [payload.serviceName]}));
                url += `?filters=${filters}`;
            }

            const swarmTasks = await HttpClient.Instance.get<any[]>(url);
            const response: GetSwarmTasksResponse = {
                results: swarmTasks || [],
                count: swarmTasks?.length || 0,
            };
            return response;
        } catch (error: any) {
            console.error("Error fetching swarm tasks:", error);
            throw error; // Re-throw to let the caller handle it
        }
    }

export async function getSwarmNodes(payload: GetSwarmPayload): Promise<unknown[]> {
        // Don't attempt to fetch nodes if swarmId is invalid
        const swarmIdStr = String(payload.swarmId || '0');
        if (!payload.swarmId || swarmIdStr === '0') {
            return [];
        }
        try {
            const nodes = await HttpClient.Instance.get<any[]>(`/api/endpoints/${payload.endpointId}/docker/nodes`);
            return nodes;
        } catch (error) {
            console.error("Failed to fetch swarm nodes:", error);
            return [];
        }
    }

export async function updateNodeAvailability(
    payload: GetSwarmPayload & { nodeId?: string; availability: "active" | "drain" | "pause"; version?: number }
): Promise<void> {
    if (!payload.nodeId) {
        throw new Error("Node ID is required to update node availability");
    }
    
    // Use short node ID (first 12 characters)
    const shortNodeId = payload.nodeId.length > 12 ? payload.nodeId.substring(0, 12) : payload.nodeId;
    
    // Fetch the full node details using GET /nodes/{id} to get the exact structure
    let nodeData: any;
    try {
        nodeData = await HttpClient.Instance.get<any>(`/api/endpoints/${payload.endpointId}/docker/nodes/${shortNodeId}`);
    } catch (error: any) {
        // Fallback to getting from list if individual fetch fails
        const nodes = await getSwarmNodes({ endpointId: payload.endpointId, swarmId: payload.swarmId });
        const node = (nodes as any[]).find((n: any) => {
            const nId = typeof n.ID === 'string' ? n.ID : '';
            const swarmIdStr = String(payload.swarmId || '0');
            return nId === payload.nodeId || nId.startsWith(payload.nodeId || '') || payload.nodeId?.startsWith(nId.substring(0, 12));
        });
        
        if (!node) {
            throw new Error("Node not found");
        }
        nodeData = node;
    }
    
    const version = payload.version || nodeData.Version?.Index;
    
    if (!version) {
        throw new Error("Could not determine node version. Please refresh and try again.");
    }
    
    // Build update body with all required fields from Spec, only changing Availability
    // Docker API expects the Spec object structure
    // Only include Name if it exists and is not empty
    const updateBody: any = {
        Availability: payload.availability
    };
    
    // Always include Role as it's required
    if (nodeData.Spec?.Role) {
        updateBody.Role = nodeData.Spec.Role;
    }
    
    // Include Name only if it exists
    if (nodeData.Spec?.Name) {
        updateBody.Name = nodeData.Spec.Name;
    }
    
    // Include Labels only if they exist and are not empty
    if (nodeData.Spec?.Labels && Object.keys(nodeData.Spec.Labels).length > 0) {
        updateBody.Labels = nodeData.Spec.Labels;
    }
    
    // Update node availability using POST with version parameter
    const url = `/api/endpoints/${payload.endpointId}/docker/nodes/${shortNodeId}/update?version=${version}`;
    
    try {
        await HttpClient.Instance.post(url, updateBody);
    } catch (error: any) {
        // Log detailed error for debugging
        console.error("Node update error details:", {
            url,
            body: updateBody,
            version,
            nodeId: shortNodeId,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
}

export async function removeTask(payload: GetSwarmPayload & { taskId: string }): Promise<void> {
    if (!payload.taskId) {
        throw new Error("Task ID is required to remove a task");
    }
    
    // In Docker Swarm, tasks are immutable and managed by services
    // Some tasks may not be directly removable via the API
    // Try both full ID and short ID - Docker APIs can be inconsistent
    const fullTaskId = payload.taskId;
    const shortTaskId = payload.taskId.length > 12 ? payload.taskId.substring(0, 12) : payload.taskId;
    
    // Try with full ID first
    let url = `/api/endpoints/${payload.endpointId}/docker/tasks/${fullTaskId}`;
    
    try {
        await HttpClient.Instance.delete(url);
        return; // Success
    } catch (error: any) {
        // If 404 with full ID, try with short ID
        if (error.response?.status === 404 && fullTaskId !== shortTaskId) {
            console.warn("Full task ID failed, trying short ID");
            url = `/api/endpoints/${payload.endpointId}/docker/tasks/${shortTaskId}`;
            try {
                await HttpClient.Instance.delete(url);
                return; // Success with short ID
            } catch (shortError: any) {
                console.error("Failed to remove task (both full and short ID):", {
                    fullId: fullTaskId,
                    shortId: shortTaskId,
                    fullError: error.response?.data,
                    shortError: shortError.response?.data,
                });
                // In Docker Swarm, tasks are managed by services and may not be directly removable
                throw new Error(`Cannot remove task. Tasks in Docker Swarm are managed by services and may need to be removed through service management. The task may have already been cleaned up automatically.`);
            }
        }
        
        // For non-404 errors, or if IDs are the same, throw original error
        console.error("Failed to remove task:", {
            taskId: fullTaskId,
            shortTaskId: shortTaskId,
            url: url,
            response: error.response?.data,
            status: error.response?.status,
        });
        
        if (error.response?.status === 404) {
            // Tasks in Docker Swarm are immutable and managed by services
            throw new Error(`Task not found or cannot be removed. Tasks in Docker Swarm are managed by services and may be automatically cleaned up.`);
        }
        throw new Error(`Failed to remove task: ${error.response?.data?.message || error.message || "Unknown error"}`);
    }
}

export async function leaveSwarm(payload: GetSwarmPayload & { nodeId?: string; force?: boolean; version?: number }): Promise<void> {
    if (!payload.nodeId) {
        throw new Error("Node ID is required to remove a node from the swarm");
    }
    
    // Use short node ID (first 12 characters) - Docker/Portainer often expects this
    const shortNodeId = payload.nodeId.length > 12 ? payload.nodeId.substring(0, 12) : payload.nodeId;
    
    // First, check current node state
    let nodeData: any;
    try {
        nodeData = await HttpClient.Instance.get<any>(`/api/endpoints/${payload.endpointId}/docker/nodes/${shortNodeId}`);
    } catch (error) {
        throw new Error("Cannot fetch node details. Node may have already been removed.");
    }
    
    const currentAvailability = nodeData?.Spec?.Availability;
    const currentState = nodeData?.Status?.State;
    const isManager = nodeData?.Spec?.Role === "manager";
    
    // If node is a manager and not the last one, we might need to demote it first
    // But for now, we'll just try to drain and remove
    
    // Drain the node if it's still active
    if (currentAvailability === "active" && currentState !== "down") {
        try {
            await updateNodeAvailability({ ...payload, availability: "drain", version: payload.version || nodeData?.Version?.Index });
            // Wait for drain to complete and tasks to migrate
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Re-fetch node data to check new state after drain
            try {
                nodeData = await HttpClient.Instance.get<any>(`/api/endpoints/${payload.endpointId}/docker/nodes/${shortNodeId}`);
            } catch (error) {
                // Node might have been removed already
            }
        } catch (drainError: any) {
            console.warn("Failed to drain node before removal:", drainError.response?.data || drainError.message);
            // Continue with removal attempt even if drain fails
        }
    }
    
    // Check if node is now down - if not, we need to use force parameter
    const updatedState = nodeData?.Status?.State;
    const forceParam = updatedState !== "down" ? "?force=true" : "";
    
    // Remove the node - Docker requires node to be "down" or use force parameter
    const url = `/api/endpoints/${payload.endpointId}/docker/nodes/${shortNodeId}${forceParam}`;
    try {
        await HttpClient.Instance.delete(url);
    } catch (error: any) {
        // If normal delete fails and we haven't tried force yet, try with force
        if (!forceParam && error.response?.status === 400) {
            const forceUrl = `/api/endpoints/${payload.endpointId}/docker/nodes/${shortNodeId}?force=true`;
            try {
                await HttpClient.Instance.delete(forceUrl);
                return; // Success with force
            } catch (forceError: any) {
                // Log detailed error for debugging
                console.error("Node delete error details (with force):", {
                    url: forceUrl,
                    nodeId: shortNodeId,
                    response: forceError.response?.data,
                    status: forceError.response?.status,
                    currentAvailability,
                    currentState: updatedState,
                    isManager
                });
                throw forceError;
            }
        }
        
        // Log detailed error for debugging
        console.error("Node delete error details:", {
            url,
            nodeId: shortNodeId,
            response: error.response?.data,
            status: error.response?.status,
            currentAvailability,
            currentState: updatedState,
            isManager
        });
        throw error;
    }
}