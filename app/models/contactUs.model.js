const mongoose = require('mongoose');

const ContactSchema = mongoose.Schema({
    fullName: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    email: String,
    message: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number
});
module.exports = mongoose.model('ContactUs', ContactSchema, 'ContactUs');