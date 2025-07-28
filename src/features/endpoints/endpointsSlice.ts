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
}

const initialState: EndpointsState = {
  endpoints: [],
  count: 0,
  selectedEndpointId: -1,
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
  async (endpointId: string) => {
    await setItemAsync(SecureStoreEntry.SELECTED_ENDPOINT_ID, endpointId)
    return endpointId;
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
      })
  },
});



export default endpointsSlice.reducer;