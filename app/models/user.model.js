const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    userType: { type: mongoose.Schema.Types.ObjectId, ref: 'UserType'},
    fullName: String,
    gender: String,
    phone: String,
    image: String,
    profession: String,
    country: String,
    city: String,
    email: String,
    password: String,
    location: String,
    bio: String,
    dateOfBirth: String,
    height: String,
    weight: String,
    skills: String,
    languagesKnown: String,
    tagLine: String,
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    followings: Array,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    noOfFeeds : Number,
    noOfImages : Number,
    noOfVideos : Number,
    noOfAudios : Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});


module.exports = mongoose.model('User', UserSchema, 'Users');