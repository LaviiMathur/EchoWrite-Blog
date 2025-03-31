import { createSlice } from "@reduxjs/toolkit";

const storedUser = JSON.parse(localStorage.getItem("user"));

const initialState = {
  status: storedUser ? true : false,
  userData: storedUser || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload.userData;
      localStorage.setItem("token", action.payload.userData.token);
      localStorage.setItem("user", JSON.stringify(action.payload.userData));
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    updateUserProfile: (state, action) => {
      state.userData = {
        ...state.userData,
        user: { ...state.userData.user, ...action.payload },
      };
      localStorage.setItem("user", JSON.stringify(state.userData)); 
    },
  },
});

export const { login, logout, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
