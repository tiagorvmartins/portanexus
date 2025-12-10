import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getSwarmStatus, getSwarmEvents } from './swarmAPI';
import GetSwarmPayload from './GetSwarmPayload';
import GetSwarmStatusResponse from './GetSwarmResponse';
import GetSwarmServicesResponse from './GetSwarmServicesResponse';
import GetSwarmTasksResponse from './GetSwarmTasksResponse';
import { getSwarmServices, getSwarmTasks } from './swarmAPI';
import SwarmSummaryStatus from "src/types/SwarmSummaryStatus";
import ServiceEntity from "src/types/ServiceEntity";
import TaskEntity from "src/types/TaskEntity";

interface SwarmState {
  healthy: boolean;
  status: SwarmSummaryStatus | null;
  services: ServiceEntity[];
  tasks: TaskEntity[];
  recentEvents: any[];
}

const initialState: SwarmState = {
  healthy: false,
  status: null,
  services: [],
  tasks: [],
  recentEvents: []
};
export const fetchSwarmEvents = createAsyncThunk<
  any[],
  GetSwarmPayload
>(
  "swarm/fetchSwarmEvents",
  async (payload: GetSwarmPayload) => {
    return await getSwarmEvents(payload);
  }
);

export const fetchSwarmStatus = createAsyncThunk<
    GetSwarmStatusResponse,
    GetSwarmPayload
>(
  "swarm/fetchSwarmStatus",
  async (payload: GetSwarmPayload) => {
    return await getSwarmStatus(payload);
  }
);

export const fetchSwarmServices = createAsyncThunk<
    GetSwarmServicesResponse,
    GetSwarmPayload
>(
  "swarm/fetchSwarmServices",
  async (payload: GetSwarmPayload) => {
    return await getSwarmServices(payload);
  }
);

export const fetchSwarmTasks = createAsyncThunk<
    GetSwarmTasksResponse,
    GetSwarmPayload
>(
  "swarm/fetchSwarmTasks",
  async (payload: GetSwarmPayload) => {
    return await getSwarmTasks(payload);
  }
);

export const swarmSlice = createSlice({
  name: 'swarm',
  initialState,
  reducers: {
    clearSwarmState: (state) => {
      state.healthy = false;
      state.status = null;
      state.services = [];
      state.tasks = [];
      state.recentEvents = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSwarmStatus.fulfilled, (state, action) => {
        state.healthy = action.payload.healthy;
        state.status = action.payload.summary;
      })
      .addCase(fetchSwarmServices.fulfilled, (state, action) => {
        state.services = action.payload.results;
      })
      .addCase(fetchSwarmTasks.fulfilled, (state, action) => {
        state.tasks = action.payload.results;
      })
      .addCase(fetchSwarmEvents.fulfilled, (state, action) => {
        state.recentEvents = action.payload;
      })
  },
});

export default swarmSlice.reducer;