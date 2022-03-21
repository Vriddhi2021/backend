const router = require("express").Router();
const User = require("../models/userModel");

router.post("/test", async (req, res) => { 
    try{
        const user = await User.findOne({
            uniqueId: req.body.userid.toLowerCase()
          });

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
    }catch(err){
        console.log(err);
        res.status(200).json({
        status: "Failed to update Payment Details.PLZ contact with organizers",
        message: err
        })
    }
    
    
} );

module.exports = router;