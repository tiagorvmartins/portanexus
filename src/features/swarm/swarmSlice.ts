import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getSwarmStatus } from './swarmAPI';
import { GetSwarmPayload } from './GetSwarmPayload';
import { getItemAsync, setItemAsync } from '../util/storage';
import { RootState } from 'src/store/store';
import SecureStoreEntry from 'src/enums/SecureStoreEntry';
import SwarmSummaryStatus from "src/types/SwarmSummaryStatus";
import ServiceEntity from "src/types/ServiceEntity";
import TaskEntity from "src/types/TaskEntity";

interface SwarmState {
  healthy: boolean;
  status: SwarmSummaryStatus;
  services: ServiceEntity[];
  tasks: TaskEntity[];
}

const initialState: SwarmState = {
  healthy: false,
  status: null,
  services: [],
  tasks: []
};

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
  reducers: {},
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
  },
});

export default swarmSlice.reducer;