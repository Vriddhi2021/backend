const router = require("express").Router();
const Team = require("../models/teamModel");
const isAuthenticated = require("../middlewares/isAuthenticated");
const UserInfoError = require("passport-google-oauth20/lib/errors/userinfoerror");
const { default: mongoose } = require("mongoose");
const User = require("../models/userModel");

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
        let teamMembers = req.body.teamMembers;
        
        for(let i = 0 ; i < teamMembers.length ; i++) //Don't replace this with forEach
        {
            const currMemberinDB = await User.findOne({uniqueId : teamMembers[i]});
            if(!currMemberinDB){
                return res.status(404).json({
                   status: `${teamMembers[i]} has not yet registered for Vriddhi`,
                });
            }

            if(currMemberinDB.paidStatus === false){
                return res.status(404).json({
                    status: `${teamMembers[i]} has not yet paid the registeration Fees for Vriddhi`
                });
            }
            const participatedEvents = Array.from(currMemberinDB.participatedEvents);
            if(participatedEvents && participatedEvents.find( element => element === eventid)){
                return res.status(404).json({
                    status: `${teamMembers[i]} has already registered in a Team for this event`
                });
            }
        }

        let newTeam;
        const session = await mongoose.startSession();

        await session.withTransaction(async () => {

            for(let i = 0 ; i < teamMembers.length ; i++) //Don't replace this with forEach
            {
                let currMemberinDB = await User.findOne({uniqueId : teamMembers[i]},null,{session : session});
                if(currMemberinDB){
                    await currMemberinDB.updateOne({
                        $push: { participatedEvents: eventid }
                    },{session : session});
                }
            }

            const id = (await Team.count()) + 1;
            newTeam = await Team.create([{uniqueId : id , ...req.body }],{session : session});
    
        });

        session.endSession();

        res.status(200).json({
        status: "Teams Registeration was Successful",
            data: {
                team: newTeam,
            }
            });
    }catch(err){
        console.log(err);
        res.status(400).json({
        status: "Teams Registeration was Unsuccessful",
        message: err
        })
    }
});

module.exports = router;