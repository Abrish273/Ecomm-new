import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import { url, setHeaders } from "./api";

const initialState = {
  token: localStorage.getItem("token"),
  name: "",
  email: "",
  _id: "",
  registerStatus: "",
  registerError: "",
  loginStatus: "",
  loginError: "",
  userLoaded: false,
};

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (values, { rejectWithValue }) => {
    try {
      const token = await axios.post(`${url}/register`, {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      localStorage.setItem("token", token.data);

      return token.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (values, { rejectWithValue }) => {
    try {
      const token = await axios.post(`${url}/login`, {
        email: values.email,
        password: values.password,
      });

      localStorage.setItem("token", token.data);
      return token.data;
    } catch (error) {
      console.log(error.response);
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUser = createAsyncThunk(
  "auth/getUser",
  async (id, { rejectWithValue }) => {
    try {
      const token = await axios.get(`${url}/user/${id}`, setHeaders());

      localStorage.setItem("token", token.data);

      return token.data;
    } catch (error) {
      console.log(error.response);
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loadUser(state, action) {
      // Your existing code for loadUser reducer
    },
    logoutUser(state, action) {
      // Your existing code for logoutUser reducer
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state, action) => {
        return { ...state, registerStatus: "pending" };
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        // Your existing code for registerUser.fulfilled
      })
      .addCase(registerUser.rejected, (state, action) => {
        // Your existing code for registerUser.rejected
      })
      .addCase(loginUser.pending, (state, action) => {
        // Your existing code for loginUser.pending
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        // Your existing code for loginUser.fulfilled
      })
      .addCase(loginUser.rejected, (state, action) => {
        // Your existing code for loginUser.rejected
      })
      .addCase(getUser.pending, (state, action) => {
        // Your existing code for getUser.pending
      })
      .addCase(getUser.fulfilled, (state, action) => {
        // Your existing code for getUser.fulfilled
      })
      .addCase(getUser.rejected, (state, action) => {
        // Your existing code for getUser.rejected
      });
  },
});


export const { loadUser, logoutUser } = authSlice.actions;

export default authSlice.reducer;
