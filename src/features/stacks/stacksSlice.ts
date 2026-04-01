import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { get, start, stop, find, deleteStack as deleteStackApi, getStackFile as getStackFileApi, updateStack as updateStackApi, createStack as createStackApi } from './stacksAPI';
import { RootState } from 'src/store/store';
import StackEntity from 'src/features/stacks/StackEntity';
import GetStacksPayload from 'src/types/GetStacksPayload';
import CreateStackPayload from 'src/types/CreateStackPayload';
import UpdateStackPayload from 'src/types/UpdateStackPayload';


interface StacksState {
  stacks: StackEntity[];
  count: number;
  stacksRunning: number;
  stacksStopped: number;
  currentEndpointId: number; // Track which endpoint these stacks belong to
}

const initialState: StacksState = {
  stacks: [],
  count: 0,
  stacksRunning: 0,
  stacksStopped: 0,
  currentEndpointId: -1,
};

export const fetchSingleStack = createAsyncThunk<StackEntity, number>("stacks/find", 
  async (id: number) => {
  return await find(id);
});

export const fetchStacks = createAsyncThunk<
  StackEntity[], 
  GetStacksPayload
>(
  "stacks/get",
  async (payload: GetStacksPayload) => {
    const stacksResponse = await get(payload);
    return stacksResponse.results;
  }
);

export const fetchStack = createAsyncThunk<
  StackEntity, 
  GetStacksPayload
>(
  "stack/find",
  async (payload: GetStacksPayload) => {
    const stackResponse = await find(payload.stackId ?? 0);
    return stackResponse;
  }
);

export const startStack = createAsyncThunk<
  void,
  GetStacksPayload
>("stacks/start", async (data: GetStacksPayload) => {
  await start(data);
});

export const stopStack = createAsyncThunk<
  void,
  GetStacksPayload
>("stacks/stop", async (data: GetStacksPayload) => {
  await stop(data);
});

export const restartStack = createAsyncThunk<
  void,
  GetStacksPayload
>("stacks/restart", async (data: GetStacksPayload) => {
  await stop(data);
  await start(data);
});

export const deleteStack = createAsyncThunk<
  number,
  { stackId: number; endpointId: number }
>("stacks/delete", async ({ stackId, endpointId }) => {
  await deleteStackApi(stackId, endpointId);
  return stackId;
});

export const getStackFile = createAsyncThunk<
  string,
  number
>("stacks/getFile", async (stackId: number) => {
  return await getStackFileApi(stackId);
});

export const updateStack = createAsyncThunk<
  StackEntity,
  UpdateStackPayload
>("stacks/update", async (payload: UpdateStackPayload) => {
  return await updateStackApi(payload);
});

export const createStack = createAsyncThunk<
  StackEntity,
  CreateStackPayload
>("stacks/create", async (payload: CreateStackPayload) => {
  return await createStackApi(payload);
});

export const stackSlice = createSlice({
  name: 'stacks',
  initialState,
  reducers: {
    clearStacksState: (state) => {
      state.stacks = [];
      state.count = 0;
      state.stacksRunning = 0;
      state.stacksStopped = 0;
      state.currentEndpointId = -1;
    },
    removeStack: (state, action: { payload: number }) => {
      state.stacks = state.stacks.filter(s => s.Id !== action.payload);
      state.count = state.stacks.length;
      state.stacksRunning = state.stacks.filter(s => s.Status === 1).length;
      state.stacksStopped = state.stacks.filter(s => s.Status !== 1).length;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(deleteStack.fulfilled, (state, action) => {
        state.stacks = state.stacks.filter(s => s.Id !== action.payload);
        state.count = state.stacks.length;
        state.stacksRunning = state.stacks.filter(s => s.Status === 1).length;
        state.stacksStopped = state.stacks.filter(s => s.Status !== 1).length;
      })
      .addCase(fetchStacks.fulfilled, (state, action) => {
        const fetchedEndpointId = action.meta.arg.endpointId;
        
        // Always replace stacks - they should be fresh from API
        // If endpoint changed (or was cleared), currentEndpointId will be different
        state.stacks = action.payload;
        state.currentEndpointId = fetchedEndpointId;
        
        state.count = action.payload.length;
        state.stacksRunning = action.payload.filter(p => p.Status === 1).length
        state.stacksStopped = action.payload.filter(p => p.Status !== 1).length
      })
  },
});



export const selectStacks = (state: RootState) => state.stacks;

export default stackSlice.reducer;