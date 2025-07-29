import { createSlice } from '@reduxjs/toolkit';

interface LoadingState {  
  loadingComponentsAmount: number;
}

const initialState: LoadingState = {
  loadingComponentsAmount: 0
};

export const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    addLoadingComponent: (state) => {
      state.loadingComponentsAmount++;
    },
    removeLoadingComponent: (state) => {
      if (state.loadingComponentsAmount > 0)
        state.loadingComponentsAmount--;
    },
  },
});

export const { addLoadingComponent, removeLoadingComponent } = loadingSlice.actions;
export default loadingSlice.reducer;