const router = require("express").Router();
const Event = require("../models/eventModel");
const User = require("../models/userModel");
const isAuthenticated = require("../middlewares/isAuthenticated");

//custom search for all the events ex-  /Event?fest=NU
//browser
router.get("/", async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    //filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Event.find(JSON.parse(queryStr));

    //sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("startTime");
    }
    //limitFields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //paginate
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const num = await Event.countDocuments();
      if (skip >= num) throw new Error("This page does not exist");
    }

    const events = await query;

    res.status(200).json({
      status: "success",
      results: events.length,
      data: {
        events,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "Unsuccessful",
      message: err,
    });
  }
});
//get a event detail using id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findOne({ uniqueId: id });
    const count = await Event.count();
    if (id > count) {
      res.status(404).send("Not found");
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(400).json({
      status: "Unsuccessful",
      message: err,
    });
  }
});

//register a event
router.post("/Register", async (req, res) => {
  try {
    const id = (await Event.count()) + 1;
    const newevent = Object.assign({ uniqueId: id }, req.body);
    const newEvent = await Event.create(newevent);
    res.status(200).json({
      status: "Successful",
      data: {
        event: newEvent,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "Unsuccessful",
      message: err,
    });
  }
});

//follow a event
router.put("/:id/register", isAuthenticated, async (req, res) => {
  try {
    const currentUser = await User.findOne({
      googleId: req.user.data.googleId,
    });
    if (currentUser.registered) {
      if (!currentUser.participatedEvents.includes(req.params.id)) {
        await currentUser.updateOne({
          $push: { participatedEvents: req.params.id },
        });
        res.status(200).json("Event has been added");
      } else {
        res.status(403).json("You have already registered for this event");
      }
    } else {
      res.redirect("https://vriddhinitr.com/User/Register");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//unfollow a event
router.put("/:id/unregister", isAuthenticated, async (req, res) => {
  try {
    const currentUser = await User.findOne({
      googleId: req.user.data.googleId,
    });
    if (currentUser.registered) {
      if (currentUser.participatedEvents.includes(req.params.id)) {
        await currentUser.updateOne({
          $pull: { participatedEvents: req.params.id },
        });
        res.status(200).json("Event has been Unregistered");
      } else {
        res.status(403).json("You did not register for this event");
      }
    } else {
      res.redirect("https://vriddhinitr.com/User/Register");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
