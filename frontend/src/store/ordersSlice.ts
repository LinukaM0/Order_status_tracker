import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { fetchOrders, fetchOrderById } from '../services/api';
import type { Order, OrderWithHistory } from '../types';

interface OrdersState {
  list: Order[];
  selected: OrderWithHistory | null;
  statusFilter: string;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  list: [],
  selected: null,
  statusFilter: '',
  loading: false,
  error: null,
};

export const loadOrders = createAsyncThunk(
  'orders/loadOrders',
  async (status: string | undefined) => {
    return fetchOrders(status);
  }
);

export const loadOrderById = createAsyncThunk(
  'orders/loadOrderById',
  async (id: string) => {
    return fetchOrderById(id);
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<string>) {
      state.statusFilter = action.payload;
    },
    clearSelected(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(loadOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load orders';
      })
      .addCase(loadOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(loadOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load order';
      });
  },
});

export const { setStatusFilter, clearSelected } = ordersSlice.actions;
export default ordersSlice.reducer;
