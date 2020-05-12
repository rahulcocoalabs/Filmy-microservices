const mongoose = require('mongoose');
var options = {
    toObject: {
        virtuals: true,
   
    },
    toJSON: {
        virtuals: true,
     
    }
}
const FeedSchema = mongoose.Schema({
    content: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    images: Array,
    videos: Array,
    audios: Array,
    emotions: [{
        emotion: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    commentsIds: Array,
    noOfComments : Number,
    noOfLikes : Number,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

},options);
FeedSchema.virtual('yourEmotion').get(function () {
    return "";
  });
module.exports = mongoose.model('Feed', FeedSchema, 'Feeds');