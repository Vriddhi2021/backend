const router = require("express").Router();
const Team = require("../models/teamModel");
const isAuthenticated = require("../middlewares/isAuthenticated");

//To get info about all Teams.
router.get("/", async (req, res) => { 
    try{
        const allteams = await Team.find();
        res.status(200).json({
            data: allteams
            });
    }catch(err){
        res.status(400).json({
        status: "Failed to fetch all Teams",
        message: err
        })
    }
    
    
} );

//To register a new Team.
router.post("/Register", isAuthenticated, async (req, res) => {
    try{
        const eventid = req.body.eventId;
        const teampossible = await Team.findOne({eventId:eventid}); // This needs to be updated.
        if(teampossible){
            //if for THIS event team is already created.
            return res.status(400).json({
                status: "Unsuccessful",
                message: "Team already created for this EVENT."
              });
        }

        const id = (await Team.count()) + 1;
        const newteam = Object.assign({ uniqueId: id }, req.body);
        const newTeam = await Team.create(newteam);
        res.status(200).json({
        status: "Teams Registeration was Successful",
            data: {
                team: newTeam,
            }
            });
    }catch(err){
        res.status(400).json({
        status: "Teams Registeration was Unsuccessful",
        message: err
        })
    }
});

module.exports = router;