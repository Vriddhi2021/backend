const router = require("express").Router();
const User = require("../models/userModel");

router.post("/test", async (req, res) => { 
    try{
        console.log(11);
        // console.log(req.body.userid);
        // console.log(req);
        // console.log(req.body);
        console.log(req.query);
        console.log(req.query.valid);

        const user = await User.findOne({
            // uniqueId: req.body.userid.toLowerCase()
            uniqueId: (req.query.valid).toLowerCase()
          });

          console.log(user);

          if(user){
            await user.updateOne({paidStatus : true});
            res.status(200).json({
                message : "Successfull"
                });
          }
          else{
            res.status(200).json({
                message : "USER NOT FOUND"
                });
          }  

          console.log("222");

    }catch(err){
        console.log(err);
        res.status(200).json({
        status: "Failed to update Payment Details.PLZ contact with organizers",
        message: err
        })
    }
    
} );

module.exports = router;