const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    userType: { type: mongoose.Schema.Types.ObjectId, ref: 'UserType'},
    fullName: String,
    gender: String,
    phone: String,
    profession: String,
    country: String,
    city: String,
    email: String,
    profilePic: String,
    password: String,
    location: String,
    bio: String,
    dateOfBirth: String,
    height: String,
    weight: String,
    skills: Array,
    languagesKnown: Array,
    tagLine: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});


module.exports = mongoose.model('User', UserSchema, 'Users');