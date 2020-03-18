const mongoose = require('mongoose');

const ChatSchema = mongoose.Schema({
    chatFrom: String,
    chatTo: String,
    message: String,
    chatStatus: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Chat', ChatSchema, 'Chats');