function feedsController(methods, options) {
  var Feed = require('../models/feed.model.js');
  var User = require('../models/user.model.js');
  var Comments = require('../models/comments.model.js');
  var config = require('../../config/app.config.js');
  var feedsConfig = config.feeds;
  var moment = require('moment');
  var ObjectId = require('mongoose').Types.ObjectId;
  this.createFeed = (req, res) => {
    console.log('in create feed');
    var userData = req.identity.data;
    var userId = userData.id;
    var content = req.body.content;
    if (!content) {
      return res.send({
        success: 0,
        statusCode: 401,
        message: 'Feed content cannot be empty'
      })
    };
    const feeds = new Feed({
      userId: userId,
      content: content,
      images: 'photo-1511367461989-f85a21fda167 (1)-2877ca0b115857866666047b5021ab9f4bb58f43-1152ccd1446881cf31d23442a089362559cfffba.jpg',
      status: 1,
      tsCreatedAt: Number(moment().unix()),
      tsModifiedAt: null
    })
    feeds.save().then(feedsData => {
      res.send({
        success: 1,
        statusCode: 200,
        message: 'You have posted successfully'
      })
    }).catch(err => {
      res.send({
        success: 0,
        statusCode: 500,
        message: err.message
      })
    })
  };

  this.getFeed = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.id;
    var UserData = await User.findOne({
      _id: userId
    });
    var followersArray = UserData.followers;
    var findCriteria = {
      $or: [{
          userId: userId
        },
        {
          userId: {
            $in: followersArray
          }
        }
      ]
    };
    Feed.find(findCriteria).sort({
      'tsCreatedAt': -1
    }).then(data => {
      res.send({
        success: 1,
        statusCode: 200,
        message: 'Feeds listed successfully',
        basePath: feedsConfig.basePath,
        items: data
      })
    })
  };

  this.addComment = (req, res) => {
    console.log('in add comment');
    var userData = req.identity.data;
    var userId = userData.id;
    var postId = req.body.postId;
    var comment = req.body.comment;
    var isValidId = ObjectId.isValid(postId);
    if (!postId) {
      return res.send({
        success: 0,
        statusCode: 401,
        message: 'PostId missing'
      })
    };
    if (!isValidId) {
      var responseObj = {
        success: 0,
        status: 401,
        errors: {
          field: "id",
          message: "id is invalid"
        }
      }
      res.send(responseObj);
      return;
    }
    var newComments = new Comments({
      userId: userId,
      postId: postId,
      comment: comment,
      status: 1,
      tsCreatedAt: Number(moment().unix()),
      tsModifiedAt: null
    });

    newComments.save().then(commentsData => {
      res.send({
        success: 1,
        statusCode: 200,
        message: 'Comments added successfully'
      })
    }).catch(err => {
      res.send({
        success: 0,
        statusCode: 500,
        message: err.message
      })
    })

  };

  this.getComment = (req, res) => {
    var postId = req.params.postId;
    var findCriteria = {
      postId: postId
    };
    Comments.find(findCriteria).then(comments => {
      res.send({
        success: 1,
        statusCode: 200,
        items: comments,
        message: 'Comments listed successfully'
      })
    })
  };
}

module.exports = feedsController;
