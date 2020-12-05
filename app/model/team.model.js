const mongoose = require('mongoose');

const TeamSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, required: false, unique: false }
});

module.exports = mongoose.model('Team', TeamSchema);