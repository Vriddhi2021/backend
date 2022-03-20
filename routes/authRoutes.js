const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/login/success", async (req, res) => {
  if (req.user) {
    let user = {
      name: req.user.name.givenName,
      email: req.user._json.email,
      provider: req.user.provider,
      googleId: req.user.id,
    };
    const id = req.user._json.email;
    let idstr = JSON.stringify(id)
      .replace("@gmail.com", "")
      .split('"')
      .join("")
      .toLowerCase();
    let token = jwt.sign(
      {
        data: user,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30d" }
    ); // expires in 30 days
    console.log(token);
    const currentuser = await User.findOne({ googleId: user.googleId });
    let userFound = false;
    if (currentuser) {
      userFound = true;
    }
    res.status(200).json({
      success: true,
      message: "successfull",
      jwt: `BEARER ${token}`,
      user: req.user,
      userid:idstr
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "https://www.vriddhinitr.com//User/Register",
    failureRedirect: "",
  })
);

router.get("/signout", (req, res) => {
  // res.clearCookie("jwt").sendStatus(200);
  req.logOut();
  res.redirect("https://www.vriddhinitr.com");
});

module.exports = router;
