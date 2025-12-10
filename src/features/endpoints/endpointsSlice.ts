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
  selectedSwarmId: number | string;  // SwarmId is a string hash, not a number
}

const initialState: EndpointsState = {
  endpoints: [],
  count: 0,
  selectedEndpointId: -1,
  selectedSwarmId: '0',  // SwarmId is a string, not a number
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
  async (endpointId: string | number, { dispatch, getState } ) => {
    const endpointIdValue = endpointId ? endpointId.toString() : '-1';
    await setItemAsync(SecureStoreEntry.SELECTED_ENDPOINT_ID, endpointIdValue)
    const state = getState() as RootState;
    // Do not mutate state directly; return parsed number for reducer.
    return endpointId ? parseInt(endpointIdValue) : -1;
  }
);

export const setSelectedSwarmId = createAsyncThunk(
  "endpoints/selectedSwarmId",
  async (swarmId: string | number | null, { dispatch, getState } ) => {
    const swarmIdValue = swarmId ? swarmId.toString() : '0';
    await setItemAsync(SecureStoreEntry.SELECTED_SWARM_ID, swarmIdValue);
    // Return the string value - SwarmId is a Docker cluster ID (string hash), not a number
    return swarmId && swarmId !== '0' ? swarmIdValue : '0';
  }
);

export const getSelectedEndpoint = createAsyncThunk("endpoints/getSelectedEndpoint",
  async (_, { dispatch, getState } ) => {
    const selectedEndpointOnStorage = await getItemAsync(SecureStoreEntry.SELECTED_ENDPOINT_ID)
    const selectedSwarmIdOnStorage = await getItemAsync(SecureStoreEntry.SELECTED_SWARM_ID)
    const state = getState() as RootState;
    state.endpoints.selectedEndpointId = selectedEndpointOnStorage ? parseInt(selectedEndpointOnStorage) : -1
    // SwarmId is stored as string, not parsed as number
    state.endpoints.selectedSwarmId = selectedSwarmIdOnStorage && selectedSwarmIdOnStorage !== '0' ? selectedSwarmIdOnStorage : '0'
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
        // Ensure we have a valid selection after refresh
        if ((state.selectedEndpointId === -1 || !state.endpoints.find(e => Number(e.Id) === state.selectedEndpointId)) && state.endpoints.length > 0) {
          // Prefer the first UP endpoint; otherwise fall back to the first.
          const firstUp = state.endpoints.find(e => e.Status !== 'DOWN');
          const firstEndpoint = firstUp ?? state.endpoints[0];
          state.selectedEndpointId = Number(firstEndpoint.Id ?? -1);
          if (firstEndpoint.IsSwarm) {
            // SwarmId is a string hash, store as string
            state.selectedSwarmId = firstEndpoint.SwarmId || '0';
          } else {
            state.selectedSwarmId = '0';
          }
        }
      })
      .addCase(setSelectedEndpoint.fulfilled, (state, action) => {
        // Clear containers and stacks when endpoint changes
        // This is done by dispatching clear actions from the screens/effects
        state.selectedEndpointId = action.payload ?? -1;
        const endpointSelected = state.endpoints.find(x => Number(x.Id) === state.selectedEndpointId);
        if (endpointSelected) {
          // SwarmId is a string hash, store as string
          state.selectedSwarmId = endpointSelected.IsSwarm ? (endpointSelected.SwarmId || '0') : '0';
        } else {
          state.selectedSwarmId = '0';
        }
      })
      .addCase(setSelectedSwarmId.fulfilled, (state, action) => {
        // SwarmId is stored as string (Docker cluster ID hash)
        state.selectedSwarmId = action.payload || '0';
      })
  },
});



export default endpointsSlice.reducer;