const router = require('express').Router();
const Team = require('./../model/team.model')

router.post('/', function(req, res){
    if(!req.body.name) {
        return res.status(400).send({
            message: "Category name can not be empty"
        });
    }
  
    // Create a Category
    const team = new Team({
        name: req.body.name,
        image: req.body.image
    });
  
    // Save Category in the database
    team.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Category."
        });
    });
})

router.get('/', function (req, res) {
    Team.aggregate([
        { "$addFields": { "_id": { "$toString": "$_id" }}},
        { "$lookup": {
            "from": "matches",
            "localField": "_id",
            "foreignField": "Teams.id",
            "as": "matches"
          }}
    ]).then(allTeamMatches => {
        let finalResult = [];
        if(allTeamMatches.length === 0) {
            res.json({message: "No teams found"})
        }

        allTeamMatches.forEach(teamMatch => {
            let tempResult = {
                id:teamMatch._id,
                name: teamMatch.name,
                image:teamMatch.image,
                totalMatches: 0,
                win:0,
                lost:0,
                draw:0,
                points:0
            }
            if(teamMatch.matches && teamMatch.matches.length > 0) {
                tempResult.totalMatches = teamMatch.matches.length;
                teamMatch.matches.forEach(match => {
                    let currentTeam = match.Teams.find(team => team.id === teamMatch._id);
                    let otherTeam = match.Teams.find(team => team.id !== teamMatch._id);

                    if(currentTeam && otherTeam) {
                        if(currentTeam.score > otherTeam.score) {
                            tempResult.win++;
                            tempResult.points += 2;
                        } else if (currentTeam.score < otherTeam.score) {
                            tempResult.lost++;
                        } else if (currentTeam.score === otherTeam.score) {
                            tempResult.draw++;
                            tempResult.points += 1;
                        }
                            
                    }
                });
            }
            finalResult.push(tempResult);
        });
        res.json(finalResult);
    }).catch(err => res.json(err));
})



module.exports = router;