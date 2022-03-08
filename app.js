const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const createPassportStrategies = require("./passport.js");
const isAuthenticated = require("./middlewares/isAuthenticated.js");
const mongoose = require("mongoose");

require("dotenv").config();
const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: true,
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

createPassportStrategies(passport);

app.use("/Auth", authRoutes);
app.use("/Event", eventRoutes);
app.use("/User", userRoutes);
app.use("/Team", teamRoutes);
// app.use(isAuthenticated);

const port = process.env.PORT || 4000;

app.listen(port, () =>
  console.log(
    `Server is running at port ${port}.`
  )
);
