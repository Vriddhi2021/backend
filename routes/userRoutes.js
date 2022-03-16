const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const nodemailer = require("nodemailer");

router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ googleId: req.user.data.googleId });

    const { isNitr, __v, _id, googleId, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.post("/Register", isAuthenticated, async (req, res) => {
  try {
    const id = req.user.data.email;
    let idstr = JSON.stringify(id)
      .replace("@gmail.com", "")
      .split('"')
      .join(""); // Extract User Name from gmail.
    // const id = (await User.count()) + 1;
    const possibleuser = await User.findOne({
      googleId: req.user.data.googleId,
    });
    if (possibleuser) {
      res.status(400).json({
        status: "Unsuccessful",
        message: "gmail already exists",
      });
      return;
    }
    const newuser = Object.assign(
      { uniqueId: idstr },
      { googleId: req.user.data.googleId },
      { registered: true },
      { email: req.user.data.email },
      req.body
    );
    const newUser = await User.create(newuser);
    if (newUser.isNitr && newUser.nitrMail) {
      var string = newUser.nitrMail;
      res.redirect("/User/auth/otp-verify?valid=" + string);
    } else {
      res.redirect("/");
    }
  } catch (err) {
    res.status(400).json({
      status: "Unsuccessful",
      message: err,
    });
  }
});
router.patch("/:id", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { googleId: req.user.data.googleId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
});
router.get("/auth/otp-verify", async (req, res) => {
  try {
    let passedEmail = req.query.valid;
    if (passedEmail) {
      let otpcode = Math.floor(Math.random() * 10000 + 1);
      const newData = Object.assign(
        { email: passedEmail },
        { expireIn: new Date().getTime() + 600 * 1000 },
        { code: otpcode }
      );
      const newOtp = await Otp.create(newData);
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "jb9086699@gmail.com",
          pass: "Password##1234",
        },
      });

      var mailOptions = {
        from: "jb9086699@gmail.com",
        to: `${passedEmail}`,
        subject: "OTP verification Vriddhi",
        text: `${otpcode}`,
      };

      transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          console.log(error);
          res.status(400).json({
            status: "Failed to send email",
            message: err,
          });
          return;
        } else {
          console.log("Email sent: " + info.response);
          res.status(200).json({
            status:
              "OTP successfully sent to your Email. Please check your zimbra mail",
          });
          return;
        }
      });
    } else {
      res.status(400).json({
        status: "Failed to send email",
        message: err,
      });
      return;
    }
  } catch (err) {
    res.status(400).json({
      status: "No email found",
      message: err,
    });
  }
});
router.post("/auth/otp-verify", async (req, res) => {
  try {
    let data = await Otp.find({
      email: req.query.valid,
      code: req.body.otpCode,
    });

    if (data) {
      let currentTime = new Date().getTime();
      let diff = data.expireIn - currentTime;
      if (diff < 0) {
        res.send("Otp expired");
        return;
      } else {
        let user = await User.findOne({ nitrMail: req.query.valid });

        if (user) {
          user.paidStatus = true;
          user.save();
          res
            .status(200)
            .send("Your Zimbra mail was successfully verified.Thank You!");
          return;
        } else {
          res
            .status(400)
            .send("Please provide correct OTP details and try again");
          return;
        }
      }
    } else {
      res.status(400).json({
        status: "OTP verification failed",
        message: err,
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "OTP verification failed",
      message: err,
    });
  }
});
module.exports = router;
