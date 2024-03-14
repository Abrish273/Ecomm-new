const mongoose = require("mongoose");

const letsOrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    customerId: { type: String, required: true },
  },
  { timestamps: true }
);

const LetsOrder = mongoose.model("LetsOrder", letsOrderSchema);

module.exports = LetsOrder;
