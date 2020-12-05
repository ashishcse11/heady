const mongoose = require('mongoose');

const MatchSchema = mongoose.Schema({
    Teams: [{ type : mongoose.Schema.Types.Mixed, ref: 'Team' }],
}, {
    timestamps: true
});

module.exports = mongoose.model('Match', MatchSchema);