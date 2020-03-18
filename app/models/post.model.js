const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    content: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    images: Array,
    videos: Array,
    content: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Post', PostSchema, 'Posts');