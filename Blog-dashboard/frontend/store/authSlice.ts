import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
}
type AuthState = {
  user: User | null;
  token: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState:  initialState,
  reducers: {
    login(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      
      localStorage.setItem("token", action.payload.token); // Save token to local storage
      const {id, name, email} = action.payload.user;
      localStorage.setItem("user", JSON.stringify({id, name, email})); // Save user to local storage
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token"); // Remove token from local storage
      localStorage.removeItem("user"); // Remove user from local storage
      
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    }
    
  },
});
export const { login, logout, setToken } = authSlice.actions;
export default authSlice;