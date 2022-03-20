const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const passport = require("passport");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const createPassportStrategies = require("./passport.js");
const mongoose = require("mongoose");
const { default: paymentConfirm } = require("./routes/paymentRoutes");

require("dotenv").config();
const app = express();

// Middlewares
app.use(morgan("dev"));
// app.use(cors({ origin: "*" }));
app.use(
  cors({
    origin: "https://www.vriddhinitr.com",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

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
app.use("/Payment", paymentRoutes);
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server is running at port ${port}.`));
