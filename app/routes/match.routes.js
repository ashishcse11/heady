const router = require('express').Router();
const Match = require('./../model/match.model');

router.post('/', function(req, res){
    if(!req.body.team) {
        return res.status(400).send({
            message: "Category name can not be empty"
        });
    }
  
    // Create a Category
    const match = new Match({
        Teams: req.body.team
    });
  
    // Save Category in the database
    match.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Category."
        });
    });
});

router.get('/:teamId', (req, res) => {
    let teamId = req.params.teamId;

    Match.aggregate([
        {$match:{'Teams.id': teamId}},
        {$addFields: {
                convertedField: {
                    $map: {
                        input: "$Teams",
                        as: "r",
                        in: {id: 
                            { $toObjectId: "$$r.id" },
                            score:  "$$r.score"
                        }   
                    }
                }
            }
        },
        { $lookup : {
            "from": "teams",
            "localField": "convertedField.id",
            "foreignField": "_id",
            "as": "matchDetails"
        }}
    ]).then(results => {
        let finalResults = [];
        if(results.length > 0) {
            results.forEach(result => {
                let match = result.matchDetails;
                let score = result.convertedField;
                let currentTeam = match.find(m => m._id.toHexString() === teamId);
                let opponentTeam = match.find(m => m._id.toHexString() !== teamId);

                let currentTeamScore = score.find(m => m.id.toHexString() === teamId);
                let opponentTeamScore = score.find(m => m.id.toHexString() !== teamId);

                if(currentTeam && opponentTeam) {
                    let temp = {};
                    temp.match_vs = `${currentTeam.name} vs ${opponentTeam.name}`;
                    if(currentTeamScore.score > opponentTeamScore.score) {
                        temp.color = 'green';
                    } else if(opponentTeamScore.score > currentTeamScore.score) {
                        temp.color = 'red';
                    } else if(currentTeamScore.score === opponentTeamScore.score) {
                        temp.color = 'white';
                    }

                    finalResults.push(temp);
                }
            })
        }
        res.json(finalResults);
    }).catch(err => res.json(err))
})




module.exports = router;