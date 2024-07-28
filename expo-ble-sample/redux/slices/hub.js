import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useAuth } from '../../context/authContext';

// Fetch hub data
export const fetchHubData = createAsyncThunk(
  'hub/fetchHubData',
  async ({ userId, getRaspDataByUserId }, { rejectWithValue }) => {
    try {
      const response = await getRaspDataByUserId(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Activate hub and fetch updated data
export const activateHubThunk = createAsyncThunk(
  'hub/activateHub',
  async ({ code, userId, activateHub, getRaspDataByUserId }, { dispatch, rejectWithValue }) => {
    try {
      await activateHub(code, userId);
      await dispatch(fetchHubData({ userId, getRaspDataByUserId }));
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  hub: [],
  hubLoading: false,
  hubError: null,
  hubSuccess: null,
};

const hubSlice = createSlice({
  name: 'hub',
  initialState,
  reducers: {
    setHubLoading: (state, action) => {
      state.hubLoading = action.payload;
    },
    clearHubMessages: (state) => {
      state.hubError = null;
      state.hubSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHubData.pending, (state) => {
        state.hubLoading = true;
      })
      .addCase(fetchHubData.fulfilled, (state, action) => {
        state.hubLoading = false;
        state.hub = action.payload;
      })
      .addCase(fetchHubData.rejected, (state, action) => {
        state.hubLoading = false;
        state.hubError = action.payload;
      })
      .addCase(activateHubThunk.pending, (state) => {
        state.hubLoading = true;
      })
      .addCase(activateHubThunk.fulfilled, (state) => {
        state.hubLoading = false;
        state.hubSuccess = 'Hub activated successfully';
      })
      .addCase(activateHubThunk.rejected, (state, action) => {
        state.hubLoading = false;
        state.hubError = action.payload;
      });
  },
});

export const { setHubLoading, clearHubMessages } = hubSlice.actions;
export default hubSlice.reducer;
