import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DefaultState {
  isMobileOpenSidebar: boolean;
  isOpenSidebar: boolean;
  country: string;
}

const initialState: DefaultState = {
  isOpenSidebar: true,
  isMobileOpenSidebar: false,
  country: "",
};

const headerSlice = createSlice({
  name: "header",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isOpenSidebar = !state.isOpenSidebar;
    },
    openSidebar: (state) => {
      state.isOpenSidebar = true;
    },
    closeSidebar: (state) => {
      state.isOpenSidebar = false;
    },
    toggleMobileSidebar: (state) => {
      state.isMobileOpenSidebar = !state.isOpenSidebar;
    },
    openMobileSidebar: (state) => {
      state.isMobileOpenSidebar = true;
    },
    closeMobileSidebar: (state) => {
      state.isMobileOpenSidebar = false;
    },
    setCountry: (state, action: PayloadAction<string>) => {
      state.country = action.payload;
    },
  },
});

export const { toggleSidebar, openSidebar, closeSidebar, setCountry, toggleMobileSidebar, openMobileSidebar, closeMobileSidebar, } =
  headerSlice.actions;

export default headerSlice.reducer;
