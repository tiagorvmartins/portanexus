import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { get, start, stop, getContainerStats, getContainerLogs } from './containerAPI';
import GetContainersPayload from 'src/types/GetContainersPayload';
import ControlContainerPayload from 'src/types/ControlContainerPayload';
import GetContainerStatsResponse from 'src/types/GetContainerStatsResponse';
import GetContainerStatsPayload from 'src/types/GetStatsPayload';
import GetContainerLogsPayload from 'src/types/GetContainerLogsPayload';
import GetContainerLogsResponse, { Log } from 'src/types/GetContainerLogsResponse';
import { RootState } from 'src/store/store';
import ContainerEntity from '../../types/ContainerEntity';

interface ContainersState {
  containers: ContainerEntity[];
  selectedContainer: ContainerEntity | null;
  containerLogsMap: Record<string, Log[]>;
  count: number;
  countRunning: number;
}

const initialState: ContainersState = {
  containers: [],
  selectedContainer: null,
  containerLogsMap: {},
  count: 0,
  countRunning: 0,
};

export const fetchSingleContainer = createAsyncThunk("container/find", async (payload: GetContainersPayload) => {
  const findResult = await get(payload);
  return findResult.results[0]
});

export const fetchContainers = createAsyncThunk<
  ContainerEntity[], 
  GetContainersPayload
>(
  "container/get",
  async (payload: GetContainersPayload) => {
    const containersResponse = await get(payload);
    return containersResponse.results;
  }
);

export const countContainersRunning = createAsyncThunk<
  ContainerEntity[], 
  GetContainersPayload
>(
  "container/getRunning",
  async (payload: GetContainersPayload) => {
    const containersResponse = await get(payload);
    return containersResponse.results;
  }
);

// export const countContainersExited = createAsyncThunk<
//   ContainerEntity[], 
//   GetContainersPayload
// >(
//   "container/getExited",
//   async (payload: GetContainersPayload) => {
//     const containersResponse = await get(payload);
//     return containersResponse.results;
//   }
// );

export const startContainer = createAsyncThunk<
  void,
  ControlContainerPayload
>("container/start", async (data: ControlContainerPayload) => {
  await start(data);
});

export const stopContainer = createAsyncThunk<
  void,
  ControlContainerPayload
>("container/stop", async (data: ControlContainerPayload) => {
  await stop(data);
});

export const fetchContainerStats = createAsyncThunk<
GetContainerStatsResponse, 
GetContainerStatsPayload>(
  "container/stats", async (data: GetContainerStatsPayload) => {
    return await getContainerStats(data);
  }
);

export const fetchContainerLogs = createAsyncThunk<
  GetContainerLogsResponse, 
  GetContainerLogsPayload
>(
  "container/getLogs",
  async (payload: GetContainerLogsPayload) => {
    return await getContainerLogs(payload);
  }
);

export const containerSlice = createSlice({
  name: 'container',
  initialState,
  reducers: {
    setSelectedContainer: (state, action: PayloadAction<ContainerEntity>) => {
      state.selectedContainer = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(countContainersRunning.fulfilled, (state, action) => {
        state.countRunning = action.payload.length;
      })
      .addCase(fetchContainers.fulfilled, (state, action) => {
        state.containers = action.payload;
        state.count = state.containers.length;

        action.payload.forEach((container: ContainerEntity) => {
          if (container && container.Id && !state.containerLogsMap[container.Id]) {
            state.containerLogsMap[container.Id] = [];
          }
        });
      })
      .addCase(fetchSingleContainer.fulfilled, (state, action) => {
        const updatedContainer = action.payload
        const index = state.containers.findIndex(c => c.Id === updatedContainer.Id);
        if (index !== -1) {
          state.containers[index] = updatedContainer;
        } else {
          state.containers.push(updatedContainer);
        }
      })
      .addCase(fetchContainerLogs.fulfilled, (state, action) => {
        const { containerId, results } = action.payload;
        state.containerLogsMap[containerId] = results;
      })
      .addCase(startContainer.fulfilled, (state, action) => {
        const container = state.containers.find(
          (c) => c.Id && c.Id === action.meta.arg.containerId
        );
        if (container) {
          container.Status = "running";
        }
      })
      .addCase(stopContainer.fulfilled, (state, action) => {
        const container = state.containers.find(
          (c) => c.Id && c.Id === action.meta.arg.containerId
        );
        if (container) {
          container.Status = "stopped";
        }
      });
  },
});

export const { setSelectedContainer } = containerSlice.actions;

export const selectContainers = (state: RootState) => state.containers;
export const selectContainerLogs = (containerId: number) => 
  (state: RootState) => state.containers.containerLogsMap[containerId] || [];

export default containerSlice.reducer;