import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { get, start, stop, getContainerStats, getContainerLogsApi } from './containerAPI';
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
    return await getContainerLogsApi(payload);
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
        // Merge containers by Id to keep a single source of truth across views
        const mergedById: Record<number, ContainerEntity> = {} as any;

        // Seed with existing containers
        state.containers.forEach((existing) => {
          if (existing && typeof existing.Id !== 'undefined') {
            mergedById[existing.Id] = existing;
          }
        });

        // Upsert fetched containers
        action.payload.forEach((incoming) => {
          if (incoming && typeof incoming.Id !== 'undefined') {
            mergedById[incoming.Id] = incoming;
          }
        });

        state.containers = Object.values(mergedById);
        state.count = state.containers.length;

        state.containers.forEach((container: ContainerEntity) => {
          if (container && (container as any).Id && !state.containerLogsMap[(container as any).Id]) {
            state.containerLogsMap[(container as any).Id] = [];
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
        const targetId = action.meta.arg.containerId;
        state.containers = state.containers.map((c) => {
          if (c && c.Id === targetId) {
            return { ...c, Status: "running", State: "running" } as any;
          }
          return c;
        });
      })
      .addCase(stopContainer.fulfilled, (state, action) => {
        const targetId = action.meta.arg.containerId;
        state.containers = state.containers.map((c) => {
          if (c && c.Id === targetId) {
            return { ...c, Status: "stopped", State: "stopped" } as any;
          }
          return c;
        });
      });
  },
});

export const { setSelectedContainer } = containerSlice.actions;

export const selectContainers = (state: RootState) => state.containers;
export const selectContainerLogs = (containerId: number) => 
  (state: RootState) => state.containers.containerLogsMap[containerId] || [];

export default containerSlice.reducer;