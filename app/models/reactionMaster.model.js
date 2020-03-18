const mongoose = require('mongoose');

const ReactionMasterSchema = mongoose.Schema({
    reactionsName: String,
    reactionsImage: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('ReactionMaster', ReactionMasterSchema, 'ReactionMasters');