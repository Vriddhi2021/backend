const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const nodemailer = require("nodemailer");

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ uniqueId: id });

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
      .join("")
      .toLowerCase(); // Extract User Name from gmail.
    // const id = (await User.count()) + 1;
    const possibleuser = await User.findOne({
      googleId: req.user.data.googleId,
    });
    if (possibleuser) {
      return res.status(200).json({
        // status: "Unsuccessful",
        message: "gmail already exists",
      });
      // .redirect("https://vriddhinitr.com/");
    }
    const newuser = Object.assign(
      { uniqueId: idstr },
      { googleId: req.user.data.googleId },
      { registered: true },
      { email: req.user.data.email },
      req.body
    );
    const newUser = await User.create(newuser);
    if(newUser){
      return res.status(200).json({
        message: "Successfully Registered",
      });
    }
    else{
      return res.status(200).json({
        message: "NOT Registered",
      });
    }
    
    // if (newUser.isNitr && newUser.nitrMail) {
    //   var string = newUser.nitrMail;
    //   res.redirect(
    //     "https://vriddhinitr.com/User/auth/otp-verify?valid=" + string
    //   );
    // } else {
    //   res.redirect("https://vriddhinitr.com/");
    // }
  } catch (err) {
    return res.status(200).json({
      // status: "Unsuccessful",
      message: err,
    });
    // .redirect("https://vriddhinitr.com/register");
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
      message: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(200).json({
      // status: "fail",
      message: err,
    });
  }
});
router.post("/auth/otp-verify", async (req, res) => {
  try {
    let passedEmail = req.body.nitrMail;
    if (passedEmail) {
      let otpcode = Math.floor(Math.random() * 10000 + 1);
      const newData = Object.assign(
        { email: passedEmail },
        { expireIn: new Date().getTime() + 2 * 600 * 1000 },
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
          return res.status(200).json({
            message: "Failed to send email",
            // message: error,
          });
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({
            message:
              "OTP successfully sent to your Email. Please check your zimbra mail. It generally takes 2 minutes",
          });
        }
      });
    } else {
      return res.status(200).json({
        message: "INVALID EMAIL",
        // message: err,
      });
    }
  } catch (err) {
    return (
      res
        .status(200)
        .json({
          message: "No email found",
          // message: err,
        })
        // .redirect("https://vriddhinitr.com/")
    );
  }
});
router.post("/auth/otp-verify2", async (req, res) => {
  try {
    let data = await Otp.findOne({
      email: req.body.nitrMail,
      code: req.body.otpCode,
    });

    if (data) {
      let currentTime = new Date().getTime();
      let diff = data.expireIn - currentTime;
      if (diff < 0) {
        return res.send("Otp expired");
      } else {
        let user = await User.findOne({ nitrMail: req.body.nitrMail });

        if (user) {
          user.paidStatus = true;
          user.save();
          return (
            res
              .status(200)
              .json({
                message: "Your Zimbra mail was successfully verified.Thank You!",
                // message: err,
              })
              // .send("Your Zimbra mail was successfully verified.Thank You!")
              // .redirect("https://vriddhinitr.com/")
          );
        } else {
          return res.status(200).json({
            message: "Wrong OTP",
            // message: err,
          });
        }
      }
    } else {
      return res.status(200).json({
        message: "OTP verification failed",
        // message: err,
      });
    }
  } catch (err) {
    return res.status(200).json({
      message: "OTP verification failed",
      // message: err,
    });
  }
});
module.exports = router;
