// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// import { useAuth } from "../../context/authContext";

// const { user, activateHub, activeError, getRaspDataByUserId, DeleteActivation, createHub } = useAuth();

// // Async thunks for async actions
// export const fetchRaspData = createAsyncThunk('hub/fetchRaspData', async (userId) => {
//   const response = await getRaspDataByUserId(userId); // Use your existing function
//   return response;
// });

// export const activateHubCode = createAsyncThunk('hub/activateHubCode', async ({ code, userId }) => {
//   const response = await activateHub({ code, userId }); // Use your existing function
//   return response;
// });

// export const deleteActivationThunk = createAsyncThunk('hub/deleteActivation', async (raspId) => {
//   const response = await deleteActivation(raspId); // Use your existing function
//   return response;
// });

// const hubSlice = createSlice({
//   name: 'hub',
//   initialState: {
//     devices: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchRaspData.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchRaspData.fulfilled, (state, action) => {
//         state.loading = false;
//         state.devices = action.payload;
//       })
//       .addCase(fetchRaspData.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//       })
//       .addCase(activateHubCode.fulfilled, (state, action) => {
//         // Handle success if needed
//       })
//       .addCase(deleteActivationThunk.fulfilled, (state, action) => {
//         // Handle success if needed
//       });
//   },
// });

// export default hubSlice.reducer;
