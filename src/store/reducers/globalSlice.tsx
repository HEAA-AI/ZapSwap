import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  manualSwapEnabled: false,
  slippageValue: "",
};
const globalSlice = createSlice({
  name: "global",
  initialState: initialState,
  reducers: {
    setManualSwap: (state, action) => {
      state.manualSwapEnabled = action.payload;
    },
    setSlippageValue: (state, action) => {
      state.slippageValue = action.payload;
    },

    clearGlobal: () => {
      return initialState;
    },
  },
});

export const { clearGlobal, setManualSwap, setSlippageValue } =
  globalSlice.actions;

const globalReducer = globalSlice.reducer;
export default globalReducer;
