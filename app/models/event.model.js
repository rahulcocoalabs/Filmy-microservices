const mongoose = require('mongoose');

const EventSchema = mongoose.Schema({
    title: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    description: String,
    location: Array,
    startDate: String,
    startTime: String,
    endDate: String,
    endTime: String,
    approvedStatus: String,
    approvedBy: String,
    approvedAt: Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Event', EventSchema, 'Events');