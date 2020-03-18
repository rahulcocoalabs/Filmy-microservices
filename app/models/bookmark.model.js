const mongoose = require('mongoose');

const BookmarkSchema = mongoose.Schema({
    itemId: String,
    itemType: Number,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Bookmark', BookmarkSchema, 'Bookmarks');