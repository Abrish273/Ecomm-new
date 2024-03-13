import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  items: [],
  status: null,
};

export const productsFetch = createAsyncThunk(
  "products/productsFetch",
  async (_, { rejectWithValue }) => { // Changed to destructure the second argument
    try {
      const response = await axios.get("http://localhost:5000/products");
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error); // Log the error
      return rejectWithValue(error.message); // Return the error message
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: {
    [productsFetch.pending]: (state, action) => {
      state.status = "pending";
    },
    [productsFetch.fulfilled]: (state, action) => {
      state.items = action.payload;
      state.status = "success";
    },
    [productsFetch.rejected]: (state, action) => {
      state.status = "rejected";
      console.error("Products fetch failed:", action.payload); // Log the error
    },
  },
});

export default productsSlice.reducer;

