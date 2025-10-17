import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { get } from './endpointsAPI';
import EndpointEntity from 'src/types/EndpointEntity';
import { getItemAsync, setItemAsync } from '../util/storage';
import { RootState } from 'src/store/store';
import SecureStoreEntry from 'src/enums/SecureStoreEntry';

interface EndpointsState {
  endpoints: EndpointEntity[];
  count: number;
  selectedEndpointId: number;
  selectedSwarmId: number;
}

const initialState: EndpointsState = {
  endpoints: [],
  count: 0,
  selectedEndpointId: -1,
  selectedSwarmId: 0,
};

export const fetchEndpoints = createAsyncThunk(
  "endpoints/get",
  async () => {
    const endpointsResponse = await get();
    return endpointsResponse.results;
  }
);

export const setSelectedEndpoint = createAsyncThunk(
  "endpoints/selectedEndpointId",
  async (endpointId: string, { dispatch, getState } ) => {
    await setItemAsync(SecureStoreEntry.SELECTED_ENDPOINT_ID, endpointId.toString())
    const state = getState() as RootState;
    state.endpoints.selectedEndpointId = endpointId ? parseInt(endpointId) : -1
    return endpointId;
  }
);

export const setSelectedSwarmId = createAsyncThunk(
  "endpoints/selectedSwarmId",
  async (swarmId: string, { dispatch, getState } ) => {
    await setItemAsync(SecureStoreEntry.SELECTED_SWARM_ID, swarmId.toString())
    const state = getState() as RootState;
    state.endpoints.selectedSwarmId = swarmId ? parseInt(swarmId) : 0
    return swarmId;
  }
);

export const getSelectedEndpoint = createAsyncThunk("endpoints/getSelectedEndpoint",
  async (_, { dispatch, getState } ) => {
    const selectedEndpointOnStorage = await getItemAsync(SecureStoreEntry.SELECTED_ENDPOINT_ID)
    const state = getState() as RootState;
    state.endpoints.selectedEndpointId = selectedEndpointOnStorage ? parseInt(selectedEndpointOnStorage) : -1
    return selectedEndpointOnStorage
  },
)


export const endpointsSlice = createSlice({
  name: 'endpoints',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchEndpoints.fulfilled, (state, action) => {
        state.endpoints = action.payload;
      })
      .addCase(setSelectedEndpoint.fulfilled, (state, action) => {
        state.selectedEndpointId = action.payload ? parseInt(action.payload) : -1;
        const endpointSelected = state.endpoints.find(x => x.Id === state.selectedEndpointId)
        if (endpointSelected.IsSwarm) {
           state.selectedSwarmId = endpointSelected.SwarmId
        } else {
           state.selectedSwarmId = 0
        }
      })
  },
});



export default endpointsSlice.reducer;