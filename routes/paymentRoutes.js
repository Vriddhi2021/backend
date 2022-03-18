const router = require("express").Router();
const User = require("../models/userModel");

router.post("/", async (req, res) => { 
    try{
        const user = await User.findOne({
            uniqueId: req.body.userid
          });
          await user.updateOne({paidStatus : true});
        res.status(200).json({
            message : "Successfull"
            });
    }catch(err){
        console.log(err);
        res.status(400).json({
        status: "Failed to update Payment Details.PLZ contact with organizers",
        message: err
        })
    }
    
    
} );

module.exports = router;