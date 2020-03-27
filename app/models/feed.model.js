const mongoose = require('mongoose');

const FeedSchema = mongoose.Schema({
    content: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    images: Array,
    videos: Array,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Feed', FeedSchema, 'Feeds');