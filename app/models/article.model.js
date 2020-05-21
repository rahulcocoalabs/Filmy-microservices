const mongoose = require('mongoose');

const ArticleSchema = mongoose.Schema({
    title: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    content: String,
    image: String,
    // approvedStatus: String,
    // approvedBy: String,
    // approvedAt: Number,
    emotions: [{
        emotion: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    commentsIds: Array,
    noOfComments : Number,
    noOfLikes : Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
});
module.exports = mongoose.model('Article', ArticleSchema, 'Articles');