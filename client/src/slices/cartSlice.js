import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
  cartTotalQuantity: 0,
  cartTotalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const existingItem = state.cartItems.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        existingItem.cartQuantity += 1;
        toast.info("Increased product quantity", { position: "bottom-left" });
      } else {
        state.cartItems.push({ ...action.payload, cartQuantity: 1 });
        toast.success("Product added to cart", { position: "bottom-left" });
      }
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    decreaseCartItem(state, action) {
      const itemIndex = state.cartItems.findIndex(
        (item) => item.id === action.payload.id
      );

      if (state.cartItems[itemIndex].cartQuantity > 1) {
        state.cartItems[itemIndex].cartQuantity -= 1;
        toast.info("Decreased product quantity", { position: "bottom-left" });
      } else {
        state.cartItems.splice(itemIndex, 1);
        toast.error("Product removed from cart", { position: "bottom-left" });
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    removeCartItem(state, action) {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload.id
      );

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      toast.error("Product removed from cart", { position: "bottom-left" });
    },
    getTotals(state, action) {
      const { total, quantity } = state.cartItems.reduce(
        (cartTotal, cartItem) => {
          const { price, cartQuantity } = cartItem;
          const itemTotal = price * cartQuantity;

          return {
            total: cartTotal.total + itemTotal,
            quantity: cartTotal.quantity + cartQuantity,
          };
        },
        { total: 0, quantity: 0 }
      );
      state.cartTotalQuantity = quantity;
      state.cartTotalAmount = parseFloat(total.toFixed(2));
    },
    clearCart(state, action) {
      state.cartItems = [];
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      toast.error("Cart cleared", { position: "bottom-left" });
    },
  },
});

export const { addToCart, decreaseCart, removeFromCart, getTotals, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
