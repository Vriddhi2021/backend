const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const User = require("../models/userModel");

router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ googleId: req.user.user.googleId });

    const { uniqueId, isNitr, googleId, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.post("/Register", isAuthenticated, async (req, res) => {
  try {
    const id = req.user.user.email;
    let idstr = JSON.stringify(id).replace("@gmail.com", "");
    console.log(idstr);
    // const id = (await User.count()) + 1;
    console.log(req.user.user.email);
    const possibleuser = User.findOne({ googleId: req.user.user.googleId });
    if (possibleuser) {
      res.status(400).json({
        status: "Unsuccessful",
        message: "gmail already exists",
      });
      return;
    }
    const newuser = Object.assign(
      { uniqueId: idstr },
      { googleId: req.user.user.googleId },
      { registered: true },
      req.body
    );
    const newUser = await User.create(newuser);
    res.status(200).json({
      status: "Successful",
      data: {
        user: newUser,
      },
    });
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
      { googleId: req.user.user.googleId },
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

module.exports = router;
