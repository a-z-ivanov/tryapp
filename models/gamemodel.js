var mongoose = require('mongoose');

module.exports = mongoose.model('GameModel', new mongoose.Schema({
    gamenumber: String,
    started: Boolean,
    timestamp: Date,
    game: Object
}));