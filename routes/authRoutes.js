const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://vriddhinitr.com/",
  }),
  async (req, res) => {
    let user = {
      name: req.user.name.givenName,
      email: req.user._json.email,
      provider: req.user.provider,
      googleId: req.user.id,
    };

    let token = jwt.sign(
      {
        data: user,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30d" }
    ); // expires in 30 days
    console.log(token);
    res.cookie("jwt", `BEARER ${token}`).cookie("uniqueid", `${(req.user._json.email).replace("@gmail.com", "").split('"').join("").toLowerCase()}`);
    const currentuser = await User.findOne({ googleId: user.googleId });
    if (!currentuser) {
      res.redirect("https://vriddhinitr.com/User/Register");
    } else {
      // res.redirect(`"/User/"+${currentuser.uniqueId}`);
      res.redirect("https://vriddhinitr.com/");
    }
  }
);

router.get("/signout", (req, res) => {
  res.clearCookie("jwt").sendStatus(200);
});

module.exports = router;
