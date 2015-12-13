var mongoose = require('mongoose');

module.exports = mongoose.model('GameModel', new mongoose.Schema({
    gamenumber: Number,
    started: Boolean,
    timestamp: Date,
    game: Object
}));