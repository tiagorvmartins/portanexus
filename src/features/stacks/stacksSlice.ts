import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { get, start, stop, find } from './stacksAPI';
import { RootState } from 'src/store/store';
import StackEntity from 'src/features/stacks/StackEntity';
import GetStacksPayload from 'src/types/GetStacksPayload';


interface StacksState {
  stacks: StackEntity[];
  count: number;
  stacksRunning: number;
  stacksStopped: number;
}

const initialState: StacksState = {
  stacks: [],
  count: 0,
  stacksRunning: 0,
  stacksStopped: 0
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

export const stackSlice = createSlice({
  name: 'stacks',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchStacks.fulfilled, (state, action) => {
        state.stacks = action.payload;
        state.count = action.payload.length;
        state.stacksRunning = action.payload.filter(p => p.Status === 2).length
        state.stacksStopped = action.payload.filter(p => p.Status !== 2).length
      })
  },
});



export const selectStacks = (state: RootState) => state.stacks;

export default stackSlice.reducer;