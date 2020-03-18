const mongoose = require('mongoose');

const RequestSchema = mongoose.Schema({
    requestFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    requestTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    requestStatus: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Request', RequestSchema, 'Requests');