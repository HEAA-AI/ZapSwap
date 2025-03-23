import { createSlice } from "@reduxjs/toolkit";

type Props = {
  manualSwapEnabled: boolean;
  slippageValue: string;
  sellAmount: string;
  buyAmount: string;
};

const initialState: Props = {
  manualSwapEnabled: false,
  slippageValue: "",
  sellAmount: "",
  buyAmount: "",
};
const globalSlice = createSlice({
  name: "global",
  initialState: initialState,
  reducers: {
    setSellAmount: (state, action) => {
      state.sellAmount = action.payload;
    },

    setBuyAmount: (state, action) => {
      state.buyAmount = action.payload;
    },

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

export const {
  clearGlobal,
  setManualSwap,
  setSlippageValue,
  setSellAmount,
  setBuyAmount,
} = globalSlice.actions;

const globalReducer = globalSlice.reducer;
export default globalReducer;
