const mongoose = require('mongoose');

const CommentsSchema = mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment'},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    comment: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
});
module.exports = mongoose.model('Comments', CommentsSchema, 'Comments');