const mongoose = require('mongoose');

const ReactionSchema = mongoose.Schema({
    itemId: String,
    itemType: String,
    userId: String,
    reactionId: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Reaction', ReactionSchema, 'Reactions');