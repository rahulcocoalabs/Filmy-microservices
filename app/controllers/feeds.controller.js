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

  if (!content & !req.files.images && !req.files.videos && !req.files.audios) {
    return res.send({
      success: 0,
      statusCode: 401,
      message: 'Feed cannot be empty'
    })
  };
  var type = req.body.type || null;
  var images = [];
  var audios = [];
  var videos = [];
  // return res.send(req.files)
  if (req.files.images) {
    console.log("Image field detected");
    // type = "image";
    var len = files.images.length;
    var i = 0;
    while (i < len) {
      var currentTime = moment().unix();
      let imageObj = {};
      imageObj.fileName = files.images[i].filename;
      imageObj.createdDate = currentTime;
      imageObj.status = 1;
      images.push(imageObj);
      i++;
    }
    console.log("images is " + images);
  }
  if (req.files.videos) {
    console.log(req.files.videos);
    var i = 0;

    // type = "video";
    while (i < len) {
      var currentTime = moment().unix();
      var videoObj = {};
      videoObj.fileName = files.videos[i].filename;
      videoObj.createdDate = currentTime;
      videoObj.status = 1;
      videos.push(videoObj);
      i++;
    }
  }
  if (req.files.audios) {
    console.log(req.files.audios);
    var i = 0;
    while (i < len) {
      var currentTime = moment().unix();
      var audioObj = {};
      audioObj.fileName = files.audios[i].filename;
      audioObj.createdDate = currentTime;
      audioObj.status = 1;
      audios.push(audioObj);
      i++;
    }
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

    //update post count

    var upsertData = {
      $inc: {noOfFeeds: 1}
    };

await User.update({_id: userId}, upsertData)
.catch((error) => {
  console.log(error)
  return res.status(200).send({
    message: 'Something went wrong while incrementing no of feed',
    status: false,
    error: error
  })
})

  return res.send({
    success: 1,
    statusCode: 200,
    message: 'You have posted successfully'
  })


};

exports.updateFeed = async (req, res) => {
  console.log('in update feed');
  var userData = req.user;
  var userId = userData.id;
  var feedId = req.params.id;
  var content = req.body.content;
  var files = req.files;

  if (!content && !req.files) {
    return res.send({
      success: 0,
      statusCode: 401,
      message: 'Nothing to update'
    })
  };
  var type = req.body.type || null;
  var images = [];
  var audios = [];
  var videos = [];
  // return res.send(req.files)
  let feedData = await Feed.findById(feedId)
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while posting feed',
        status: false,
        error: error
      })
    })
  if (feedData) {
    if(feedData.userId === userId){
    let update = {};
    if (content) {
      update.content = content;

    }
    if (req.files.images) {
      console.log("Image field detected");
      // type = "image";
      var len = files.images.length;
      var i = 0;
      while (i < len) {
        var currentTime = moment().unix();
        let imageObj = {};
        imageObj.fileName = files.images[i].filename;
        imageObj.createdDate = currentTime;
        imageObj.status = 1;
        images.push(imageObj);
        i++;
      }
      update.images = images;

      console.log("images is " + images);
    }
    if (req.files.videos) {
      console.log(req.files.videos);
      var i = 0;

      // type = "video";
      while (i < len) {
        var currentTime = moment().unix();
        var videoObj = {};
        videoObj.fileName = files.videos[i].filename;
        videoObj.createdDate = currentTime;
        videoObj.status = 1;
        videos.push(videoObj);
        i++;
      }
      update.videos = videos;

    }
    if (req.files.audios) {
      console.log(req.files.audios);
      var i = 0;
      while (i < len) {
        var currentTime = moment().unix();
        var audioObj = {};
        audioObj.fileName = files.audios[i].filename;
        audioObj.createdDate = currentTime;
        audioObj.status = 1;
        audios.push(audioObj);
        i++;
      }
      update.audios = audios;

    }
    update.tsModifiedAt = moment().unix();
  
    // if (!req.files.images && !req.files.videos) {
    //   type = "text";
    // }

    feedData.set(update);



    let feedData = await feedData.save()
      .catch((error) => {
        console.log(error)
        return res.status(200).send({
          message: 'Something went wrong while updating feed',
          status: false,
          error: error
        })
      })
    res.send({
      success: 1,
      statusCode: 200,
      message: 'You have updated feed successfully'
    })
  }else{
    return res.send({
      success: 0,
      statusCode: 401,
      message: 'Its not your feed'
    })
  }

  } else {
    return res.send({
      success: 0,
      statusCode: 401,
      message: 'Invalid feed'
    })
  }
};



exports.getHomeFeeds = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;
  var usersData = await User.findOne({
    _id: userId,
    status : 1
  })
  .catch((error) => {
    console.log(error)
    return res.status(200).send({
      message: 'Something went wrong while getting user data',
      status: false,
      error: error
    })
  })
  if(usersData){
  var followingsArray = usersData.followings;
  var findCriteria = {
    $or: [{
      userId: userId
    },
    {
      userId: {
        $in: followingsArray
      }
    }
    ],
    status : 1
  };
 let homeFeedData = await Feed.find(findCriteria).sort({
    'tsCreatedAt': -1
  })
  .catch((error) => {
    console.log(error)
    return res.status(200).send({
      message: 'Something went wrong while getting feed data',
      status: false,
      error: error
    })
  })
  
    res.send({
      success: 1,
      statusCode: 200,
      message: 'Feeds listed successfully',
      imageBase: feedsConfig.imageBase,
      videoBase: feedsConfig.videoBase,
      audioBase: feedsConfig.audioBase,
      items: homeFeedData
    })
  }else{
    return res.send({
      success: 0,
      statusCode: 401,
      message: 'Invalid user'
    })
  }

};

exports.deleteFeed = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;
  var feedId = req.params.id;
  let feedData = await Feed.find({
    _id: feedId,
    userId,
    status: 1
  })
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting feed',
        status: false,
        error: error
      })
    })

  if (feedData.length > 0) {
    let updateData = await Feed.update({ _id: feedId }, {
        status : 0
    })
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while deleting a feed',
        status: false,
        error: error
      })
    })

  //update post count

  var upsertData = {
    $inc: {noOfFeeds: -1}
  };

await User.update({_id: userId}, upsertData)
.catch((error) => {
console.log(error)
return res.status(200).send({
  message: 'Something went wrong while incrementing no of feed',
  status: false,
  error: error
})
})

   return res.send({
      success: 1,
      statusCode: 200,
      message: 'You have deleted a feed successfully'
    })
  }else{
    return res.send({
      success: 0,
      statusCode: 401,
      message: 'Invalid feed'
    })
  }
}



exports.addComment = (req, res) => {
  console.log('in add comment');
  var userData = req.user.data;
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
