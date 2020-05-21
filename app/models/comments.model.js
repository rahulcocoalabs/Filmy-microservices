const mongoose = require('mongoose');

const CommentsSchema = mongoose.Schema({
    feedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feed'},
    articleId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    // parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment'},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    type:String,
    comment: String,
    replies: [{
        comment: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: Number,
        tsCreatedAt: Number,
        tsModifiedAt: Number
    }],
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
});
module.exports = mongoose.model('Comments', CommentsSchema, 'Comments');