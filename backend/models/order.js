const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String },
    // the current logged in user id
    customerId: { type: String, required: true },
    paymentIntentId: { type: String },
    products: [
      {
        id: { type: String },
        name: { type: String },
        brand: { type: String },
        desc: { type: String },
        price: { type: String },
        image: { type: String },
        cartQuantity: { type: Number },
      },
    ],
    subtotal: { type: Number, required: true },
    // total is with shpping and taxes
    // total: { type: Number, required: true },
    // shipping: { type: Object, required: true },
    // delivery_status: { type: String, defult: "pending" },
    payment_status: { type: String, required: true },
  },
  { timestamps: true }
);

// Middleware to serialize the products field before saving
// orderSchema.pre('save', function(next) {
//   this.products = JSON.stringify(this.products);
//   next();
// });


const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
