const cors = require("cors");
const shortid = require("shortid");
const router = require("express").Router();
const path = require("path");
const Razorpay = require("razorpay");
const User = require("../models/userModel");
const PaymentDetail = require("../models/paymentDetail");
const isAuthenticated = require("../middlewares/isAuthenticated");
const crypto = require("crypto");
const paymentDetail = require("../models/paymentDetail");
var razorpay = new Razorpay({
  key_id: "rzp_test_8mFU15mMXQ5TXB",
  key_secret: "WJPG3dBTyAjYX75uRfGiuAhV",
});

router.post("/razorpay", isAuthenticated, async (req, res) => {
  const payment_capture = 1;
  const amount = 30;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };
  razorpay.orders
    .create(options)
    .then(async (response) => {
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      // Save orderId and other payment details
      const paymentDetail = new PaymentDetail({
        orderId: response.id,
        receiptId: response.receipt,
        status: response.status,
        gmail: req.user.data.email,
      });
      try {
        // Render Order Confirmation page if saved succesfully
        await paymentDetail.save();
        res.json({
          id: response.id,
          currency: response.currency,
          amount: response.amount,
          gmail: req.user.data.email,
        });
      } catch (err) {
        // Throw err if failed to save
        if (err) throw err;
      }
    })
    .catch((err) => {
      // Throw err if failed to create order
      if (err) throw err;
    });
});

router.post("/verification", async (req, res) => {
  // do a validation
  const secret = "12345678";

  // console.log(req.body);

  const crypto = require("crypto");

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  // console.log(digest, req.headers["x-razorpay-signature"]);

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");
    console.log(req.body.payload);
    // process it
    const payment = await PaymentDetail.findOne({
      orderId: req.body.payload.payment.entity.order_id,
    });
    if (!payment) {
      res.status(400).json("can not find");
      return;
    }
    const user = await User.findOne({ email: payment.gmail });
    user.paidStatus = true;
    user.save();
    console.log(user);
    res.status(200).json({ status: "ok"});
    return;
  } else {
    // pass it
    res.status(400).json({ status: "ok" });
    return;
  }
});

module.exports = router;
