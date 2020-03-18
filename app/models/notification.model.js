const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema({
    message: String,
    type: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    isViewed: Boolean,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Notification', NotificationSchema, 'Notifications');