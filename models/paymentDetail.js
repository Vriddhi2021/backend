const mongoose = require("mongoose");

const paymentDetailsSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  receiptId: {
    type: String,
  },
  paymentId: {
    type: String,
  },
  signature: {
    type: String,
  },
  status: {
    type: String,
  },
  gmail:{
    type:String
  }
});

module.exports = mongoose.model("PaymentDetail", paymentDetailsSchema);
