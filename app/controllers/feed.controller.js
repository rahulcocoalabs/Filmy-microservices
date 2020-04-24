// function feedsController(methods, options) {
var Feed = require('../models/feed.model.js');
var User = require('../models/user.model.js');
var Comments = require('../models/comments.model.js');
var config = require('../../config/app.config.js');
var feedsConfig = config.feeds;
var moment = require('moment');
var ObjectId = require('mongoose').Types.ObjectId;

exports.createFeed = async (req, res) => {
  console.log('in create feed');
  var userData = req.user;
  var userId = userData.id;
  var content = req.body.content;
  var files = req.files;

  if (!content) {
    return res.send({
      success: 0,
      statusCode: 401,
      message: 'Feed content cannot be empty'
    })
  };
  var type = req.body.type || null;
  var images = [];
  var documents = [];
  var videos = [];
  // return res.send(req.files)
  if (req.files.images) {
      console.log("Image field detected");
      type = "image";
      var len = files.images.length;
      var i = 0;
      while (i < len) {
          images.push(files.images[i].filename);
          i++;
      }
      console.log("images is " + images);
  }
  if (req.files.videos) {
      console.log(req.files.videos);
      type = "video";
      videos = req.files.videos[0].filename;
  }
  // if (!req.files.images && !req.files.videos && req.files.documents) {
  //     type = "document";
  //     var len = files.documents.length;
  //     var i = 0;
  //     while (i < len) {
  //         documents.push(files.documents[i].filename);
  //         i++;
  //     }

  // }
  if (!req.files.images && !req.files.videos) {
      type = "text";
  }

  const feeds = new Feed({
    userId: userId,
    content: content,
    images,
    videos,
    status: 1,
    tsCreatedAt: Number(moment().unix()),
    tsModifiedAt: null
  })



  let feedData = await feeds.save()
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while posting feed',
        status: false,
        error: error
      })
    })
  res.send({
    success: 1,
    statusCode: 200,
    message: 'You have posted successfully'
  })


};

exports.getFeed = async (req, res) => {
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

exports.addComment = (req, res) => {
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

exports.getComment = (req, res) => {
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
// }

// module.exports = feedsController;
