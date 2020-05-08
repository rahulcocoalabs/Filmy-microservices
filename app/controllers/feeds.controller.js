// function feedsController(methods, options) {
var Feed = require('../models/feed.model.js');
var User = require('../models/user.model.js');
var Comments = require('../models/comments.model.js');
var config = require('../../config/app.config.js');
var constants = require('../helpers/constants');
var feedsConfig = config.feeds;
var moment = require('moment');
var ObjectId = require('mongoose').Types.ObjectId;

exports.createFeed = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;
  var content = req.body.content;
  var files = req.files;
  if (!content & !req.files.images && !req.files.videos && !req.files.audios) {
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'Feed cannot be empty'
    })
  };
  var type = req.body.type || null;
  var images = [];
  var audios = [];
  var videos = [];
  // return res.send(req.files)
  if (req.files.images) {
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
  }
  if (req.files.videos) {
    var i = 0;
    var len = files.videos.length;

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
    var len = files.audios.length;

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
  // if (!req.files.images && !req.files.videos) {
  //   type = "text";
  // }

  const feeds = new Feed({
    userId: userId,
    content: content,
    images,
    videos,
    audios,
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
    $inc: {
      noOfFeeds: 1,
      noOfImages: images.length,
      noOfVideos: videos.length,
      noOfAudios: audios.length,
    }
  };


  await User.update({ _id: userId }, upsertData)
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while updating counts',
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
      statusCode: 400,
      message: 'Nothing to update'
    })
  };
  var type = req.body.type || null;
  var images = [];
  var audios = [];
  var videos = [];
  var incrementImagesCount = 0;
  var incrementVideosCount = 0;
  var incrementAudiosCount = 0;
  // return res.send(req.files)
  var feedData = await Feed.findById({ _id: feedId }).lean()
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while posting feed',
        status: false,
        error: error
      })
    })
  var oldVideosData = feedData.videos;
  var oldImagesData = feedData.images;
  var oldAudiosData = feedData.audios;
  console.log("feedData")
  console.log(feedData.videos)
  console.log("feedData")
  if (feedData) {
    // console.log(feedData.userId , typeof feedData.userId)
    // console.log(userId , typeof userId)
    if (JSON.stringify(feedData.userId) === JSON.stringify(userId)) {

      let update = {};
      if (content) {
        update.content = content;

      }
      if (req.files.images) {
        console.log("Image field detected");
        // type = "image";
        var len = files.images.length;
        var i = 0;
        var oldLeng = oldImagesData.length;
        if (oldLeng !== len) {
          incrementImagesCount = (len - oldLeng);
        }
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
        var len = files.videos.length;
        var oldLeng = oldVideosData.length;
        var i = 0;
        if (oldLeng !== len) {
          incrementVideosCount = (len - oldLeng);
        }
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
        var len = files.audios.length;
        var oldLeng = oldAudiosData.length;
        if (oldLeng !== len) {
          incrementAudiosCount = (len - oldLeng);
        }
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


      let feedData = await Feed.update({ _id: feedId }, update)
        .catch((error) => {
          console.log(error)
          return res.status(200).send({
            message: 'Something went wrong while updating feed',
            status: false,
            error: error
          })
        })

      var upsertData = {
        $inc: {
          noOfImages: incrementImagesCount,
          noOfVideos: incrementVideosCount,
          noOfAudios: incrementAudiosCount,
        }
      };


      await User.update({ _id: userId }, upsertData)
        .catch((error) => {
          console.log(error)
          return res.status(200).send({
            message: 'Something went wrong while updating counts',
            status: false,
            error: error
          })
        })



      return res.send({
        success: 1,
        statusCode: 200,
        message: 'You have updated feed successfully'
      })
    } else {
      return res.send({
        success: 0,
        statusCode: 400,
        message: 'Its not your feed'
      })
    }

  } else {
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'Invalid feed'
    })
  }
};

exports.getYourFeeds = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;

  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || feedsConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : feedsConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var usersData = await User.findOne({
    _id: userId,
    status: 1
  })
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting user data',
        status: false,
        error: error
      })
    })
  if (usersData) {
    var findCriteria = {
      userId,
      status: 1
    };
    let yourFeedData = await Feed.find(findCriteria)
      .populate({
        path: 'userId',
        select: '_id fullName profession image'
      }
      )
      .limit(perPage)
      .skip(offset)
      .sort({
        'tsCreatedAt': -1
      })
      .catch((error) => {
        console.log(error)
        return res.status(200).send({
          message: 'Something went wrong while getting your feed data',
          status: false,
          error: error
        })
      })

    let yourFeedsCount = await Feed.count(findCriteria)
      .sort({
        'tsCreatedAt': -1
      })
      .catch((error) => {
        console.log(error)
        return res.status(200).send({
          message: 'Something went wrong while getting your feed count',
          status: false,
          error: error
        })
      })

    let totalPages = yourFeedsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    res.send({
      success: 1,
      statusCode: 200,
      message: 'Feeds listed successfully',
      // imageBase: feedsConfig.imageBase,
      // videoBase: feedsConfig.videoBase,
      // audioBase: feedsConfig.audioBase,
      items: yourFeedData,
      count: yourFeedsCount,
      totalPages,
      hasNextPage,
    })
  } else {
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'Invalid user'
    })
  }

}


exports.getHomeFeeds = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;

  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || feedsConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : feedsConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  var usersData = await User.findOne({
    _id: userId,
    status: 1
  })
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting user data',
        status: false,
        error: error
      })
    })
  if (usersData) {
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
      status: 1
    };
    let homeFeedData = await Feed.find(findCriteria)
      .populate({
        path: 'userId',
        select: '_id fullName profession image'
      }
      )
      .limit(perPage)
      .skip(offset)
      .sort({
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

    let homeFeedsCount = await Feed.count(findCriteria)
      .sort({
        'tsCreatedAt': -1
      })
      .catch((error) => {
        console.log(error)
        return res.status(200).send({
          message: 'Something went wrong while getting your feed count',
          status: false,
          error: error
        })
      })

    let totalPages = homeFeedsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;

    res.send({
      success: 1,
      statusCode: 200,
      message: 'Feeds listed successfully',
      // imageBase: feedsConfig.imageBase,
      // videoBase: feedsConfig.videoBase,
      // audioBase: feedsConfig.audioBase,
      items: homeFeedData,
      count: homeFeedsCount,
      totalPages,
      hasNextPage,
    })
  } else {
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'Invalid user'
    })
  }

};

exports.deleteFeed = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;
  var feedId = req.params.id;
  let feedData = await Feed.findOne({
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

  if (feedData) {
    let updateData = await Feed.update({ _id: feedId }, {
      status: 0
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
    let imageCount = 0;
    let videoCount = 0;
    let audioCount = 0;
    if (feedData.images) {
      imageCount = feedData.images.length;
    }
    if (feedData.videos) {
      videoCount = feedData.videos.length;
    }
    if (feedData.audios) {
      audioCount = feedData.audios.length;
    }
    var upsertData = {
      $inc: {
        noOfFeeds: -1,
        noOfImages: (imageCount * -1),
        noOfVideos: (videoCount * -1),
        noOfAudios: (audioCount * -1),
      }
    };

    await User.update({ _id: userId }, upsertData)
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
  } else {
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'Invalid feed'
    })
  }
}



exports.addComment = async (req, res) => {
  console.log('in add comment');
  var userData = req.user;
  var userId = userData.id;
  var feedId = req.body.feedId;
  var commentId = req.body.commentId;
  var comment = req.body.comment;

  if (!feedId || !comment) {
    var errors = [];

    if (!feedId) {
      errors.push({
        field: "feedId",
        message: 'Require feedId'

      });
    }
    if (!comment) {
      errors.push({
        field: "comment",
        message: 'Require comment'
      });
    }

    return res.send({
      success: 0,
      statusCode: 400,
      errors: errors,
    });
  };

  var isValidId = ObjectId.isValid(feedId);

  if (!isValidId) {
    var responseObj = {
      success: 0,
      status: 400,
      errors: {
        field: "feedId",
        message: "feedId is invalid"
      }
    }
    res.send(responseObj);
    return;
  }
  var filters = {
    _id: feedId,
    status: 1
  };
  var queryProjection = {
    commentsIds: 1,
    _id: 1
  }
  let feedData = await Feed.findOne(filters, queryProjection)
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting feeds data',
        status: false,
        error: error
      })
    })

  if (feedData) {
    if (commentId) {
      var filters = {
        _id: commentId,
        type: constants.FEED_COMMENT,
        status: 1
      };
      var queryProjection = {
        replies: 1,
        _id: 1
      }
      let commentData = await Comments.findOne(filters, queryProjection)
        .catch((error) => {
          console.log(error)
          return res.status(200).send({
            message: 'Something went wrong while getting comment',
            status: false,
            error: error
          })
        })
      var replies = [];
      replies = commentData.replies;
      replies.push({
        comment,
        userId,
        status: 1,
        tsCreatedAt: Number(moment().unix()),
        tsModifiedAt: null
      })
      var updateData = {
        replies
      };


      await Comments.update({ _id: commentId, type: constants.FEED_COMMENT }, updateData)
        .catch((error) => {
          console.log(error)
          return res.status(200).send({
            message: 'Something went wrong while reply update',
            status: false,
            error: error
          })
        })

      return res.send({
        success: 1,
        statusCode: 200,
        message: 'Comments added successfully'
      })



    } else {

      var newComments = new Comments({
        userId,
        feedId,
        type: constants.FEED_COMMENT,
        comment: comment,
        replies: [],
        status: 1,
        tsCreatedAt: Number(moment().unix()),
        tsModifiedAt: null
      });

      let data = await newComments.save()
        .catch(err => {
          res.send({
            success: 0,
            statusCode: 500,
            message: err.message
          })
        })
      console.log("data._id")
      console.log(data._id)
      console.log("data._id")
      var upsertData = {
        $push: { commentsIds: data._id },
        $inc: {
          noOfComments: 1,
        }
      };

      await Feed.update({ _id: feedId, status: 1 }, upsertData)
        .catch((error) => {
          console.log(error)
          return res.status(200).send({
            message: 'Something went wrong while incrementing no of comments count',
            status: false,
            error: error
          })
        })

      return res.send({
        success: 1,
        statusCode: 200,
        message: 'Comments added successfully'
      })

    }

  } else {
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'Invalid feed'
    })
  }

};

exports.updateComment = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;
  var feedId = req.body.feedId;
  let commentId = req.params.id;
  var replyCommentId = req.body.replyCommentId;
  var comment = req.body.comment;

  let update = {};

  if (!comment) {
    return res.send({
      success: 0,
      message: 'Nothing to update'
    })
  }

  var isValidFeedId = ObjectId.isValid(feedId);
  var isValidCommentId = ObjectId.isValid(commentId);

  if (!isValidFeedId || !isValidCommentId) {
    var errors = [];

    if (!isValidFeedId) {
      errors.push({
        field: "feedId",
        message: 'Invalid feedId'

      });
    }
    if (!isValidCommentId) {
      errors.push({
        field: "commentId",
        message: 'Invalid commentId'
      });
    }
    if (commentId && replyCommentId) {
      var isValidReplyCommentId = ObjectId.isValid(replyCommentId);
      if (!isValidReplyCommentId) {
        errors.push({
          field: "replyCommentId",
          message: 'Invalid replyCommentId'
        });
      }
    }
    return res.send({
      success: 0,
      statusCode: 400,
      errors: errors,
    });
  }

  var filters = {
    _id: feedId,
    status: 1
  };
  var queryProjection = {
    commentsIds: 1,
    _id: 1
  }
  let feedData = await Feed.findOne(filters, queryProjection)
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting feeds data',
        status: false,
        error: error
      })
    })
  if (feedData) {

    var filters = {
      _id: commentId,
      userId,
      type: constants.FEED_COMMENT,
      status: 1
    };
    var queryProjection = {
      comment: 1,
      replies: 1,
      _id: 1
    }
    let commentData = await Comments.findOne(filters, queryProjection)
      .catch((error) => {
        console.log(error)
        return res.status(200).send({
          message: 'Something went wrong while getting feeds data',
          status: false,
          error: error
        })
      })
    if (commentData) {
      if (replyCommentId) {
        var replies = [];
        replies = commentData.replies;
        pos = replies.map(function (e) { return e._id; }).indexOf(replyCommentId);
        if(pos > -1){
          replies[pos].comment = comment;
          replies[pos].tsModifiedAt = Number(moment().unix());
          var updateComment = {};
          updateComment.replies = replies;
    
          await Comments.update({
            _id: commentId,
            type: constants.FEED_COMMENT,
            status: 1
          }, updateComment,
        
          )
            .catch((error) => {
              console.log(error)
              return res.status(200).send({
                message: 'Something went wrong while updating comment',
                status: false,
                error: error
              })
            })
            return res.send({
              success: 1,
              statusCode: 200,
              message: 'Reply comment updated successfully'
            })


        } else{
          return res.send({
            success: 0,
            statusCode: 400,
            message: 'Reply comment not exists'
          })
        }   

      } else {
        var updateComment = {
          comment,
          tsModifiedAt : Number(moment().unix())
        };

        await Comments.update({
          _id: commentId,
          userId,
          type: constants.FEED_COMMENT,
          status: 1
        }, updateComment)
          .catch((error) => {
            console.log(error)
            return res.status(200).send({
              message: 'Something went wrong while updating comment',
              status: false,
              error: error
            })
          })
          return res.send({
            success: 1,
            statusCode: 200,
            message: 'Comments updated successfully'
          })

      }

    } else {
      return res.send({
        success: 0,
        statusCode: 400,
        message: 'Invalid comment'
      })
    }



  } else {
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'Invalid feed'
    })
  }

}

// exports.getComment = (req, res) => {
//   var postId = req.params.postId;
//   var findCriteria = {
//     postId: postId
//   };
//   Comments.find(findCriteria).then(comments => {
//     res.send({
//       success: 1,
//       statusCode: 200,
//       items: comments,
//       message: 'Comments listed successfully'
//     })
//   })
// };
// }

// module.exports = feedsController;



exports.getFeedsAlbum = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;
  var params = req.query;
  var usersData = await User.findOne({
    _id: userId,
    status: 1
  })
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting user data',
        status: false,
        error: error
      })
    })
  if (usersData) {
    let page = params.page || 1;
    let perPage = Number(params.perPage) || 10;
    perPage = perPage > 0 ? perPage : 10;
    var offset = (page - 1) * perPage;
    console.log("offset : " + offset)
    console.log("perPage : " + perPage)
    if (params.type === constants.ALBUM_IMAGE) {
      let imageData = await Feed.aggregate([
        { $match: { userId: ObjectId(userId), status: 1 } },
        { $unwind: "$images" },
        // { $limit : perPage},{ $skip : offset },

        { $project: { _id: 0, 'feedId': '$_id', 'image': '$images.fileName' } },
        // {
        //   $facet: {
        //     edges: [
        //       // { $sort: sort },
        //       { $skip: offset },
        //       { $limit: perPage },
        //     ],
        //     pageInfo: [
        //       { $group: { _id: null, count: { $sum: 1 } } },
        //     ],
        //   },
        // }
      ])
        .catch((error) => {
          console.log(error)
          return res.status(200).send({
            message: 'Something went wrong while getting feeds image data',
            status: false,
            error: error
          })
        })
      let totalImageCount = usersData.noOfImages;
      totalPages = totalImageCount / perPage;
      totalPages = Math.ceil(totalPages);
      var hasNextPage = page < totalPages;

      return res.send({
        success: 1,
        statusCode: 200,
        items: imageData,
        count: totalImageCount,
        totalPages,
        hasNextPage,
        message: 'Images listed successfully'
      })
    } else if (params.type === constants.ALBUM_VIDEO) {
      let videoData = await Feed.aggregate([
        { $match: { userId: ObjectId(userId), status: 1 } },
        { $unwind: "$videos" },
        // { $limit : perPage},{ $skip : offset },
        { $project: { _id: 0, 'feedId': '$_id', 'video': '$videos.fileName' } }
      ])
        .catch((error) => {
          console.log(error)
          return res.status(200).send({
            message: 'Something went wrong while getting feeds videos data',
            status: false,
            error: error
          })
        })
      let totalVideoCount = usersData.noOfVideos;
      totalPages = totalVideoCount / perPage;
      totalPages = Math.ceil(totalPages);
      var hasNextPage = page < totalPages;

      return res.send({
        success: 1,
        statusCode: 200,
        items: videoData,
        count: totalVideoCount,
        totalPages,
        hasNextPage,
        message: 'Videos listed successfully'
      })

    } else if (params.type === constants.ALBUM_AUDIO) {
      let audioData = await Feed.aggregate([
        { $match: { userId: ObjectId(userId), status: 1 } },
        { $unwind: "$audios" },
        // { $limit : perPage},{ $skip : offset },
        { $project: { _id: 0, 'feedId': '$_id', 'audio': '$audios.fileName' } }
      ])
        .catch((error) => {
          console.log(error)
          return res.status(200).send({
            message: 'Something went wrong while getting feeds audios data',
            status: false,
            error: error
          })
        })
      let totalAudioCount = usersData.noOfAudios;
      totalPages = totalAudioCount / perPage;
      totalPages = Math.ceil(totalPages);
      var hasNextPage = page < totalPages;

      return res.send({
        success: 1,
        statusCode: 200,
        items: audioData,
        count: totalAudioCount,
        totalPages,
        hasNextPage,
        message: 'Audios listed successfully'
      })


    }



  }
}





// exports.deleteFeedsAlbum = async (req, res) => {
//   var userData = req.user;
//   var userId = userData.id;
//   var feedId = req.params.id;
//   var type = req.body.type;
//   var deleteData = req.body.deleteData;
//   if(type === constants.ALBUM_IMAGE){
//   // var type = 
//   await Promise.all(deleteData.map(async (item) => {
//     let feedData = await Feed.find({
//       _id: item.feedId,
//       userId,
//       status: 1
//     })
//       .catch((error) => {
//         console.log(error)
//         return res.status(200).send({
//           message: 'Something went wrong while getting feed',
//           status: false,
//           error: error
//         })
//       })

//   if (feedData) {image
//       // if()
//       // let updateData = await Feed.update({_id : item.fee)

//   }

//   }));
//   }
//   let feedData = await Feed.find({
//     _id: feedId,
//     userId,
//     status: 1
//   })
//     .catch((error) => {
//       console.log(error)
//       return res.status(200).send({
//         message: 'Something went wrong while getting feed',
//         status: false,
//         error: error
//       })
//     })

//   if (feedData.length > 0) {

//     let updateData = await Feed.update({ _id: feedId }, {
//         status : 0
//     })
//     .catch((error) => {
//       console.log(error)
//       return res.status(200).send({
//         message: 'Something went wrong while deleting a feed',
//         status: false,
//         error: error
//       })
//     })

//   //update post count

//   var upsertData = {
//     $inc: {
//       noOfFeeds: -1,
//       noOfImages: (feedData.images.length * -1),
//       noOfVideos: (feedData.videos.length * -1),
//       noOfAudios:  (feedData.audios.length * -1),
//     }
//   };

// await User.update({_id: userId}, upsertData)
// .catch((error) => {
// console.log(error)
// return res.status(200).send({
//   message: 'Something went wrong while incrementing no of feed',
//   status: false,
//   error: error
// })
// })

//    return res.send({
//       success: 1,
//       statusCode: 200,
//       message: 'You have deleted a feed successfully'
//     })
//   }else{
//     return res.send({
//       success: 0,
//       statusCode: 400,
//       message: 'Invalid feed'
//     })
//   }
// }



exports.addEmotionToFeed = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;
  var params = req.body;
  var userFoundFlag = false;


  //validating request
  var errors = [];
  if (!params.emotion) {
    errors.push({
      field: "emotion",
      message: "Emotion cannot be empty"
    });
  }
  if (!params.feedId) {
    errors.push({
      field: "feedId",
      message: "feedId cannot be empty"
    });
  }
  if (params.emotion) {
    if (!isInArray(params.emotion, feedsConfig.emotionsList)) {
      errors.push({
        field: "emotion",
        message: "Invalid emotion"
      });
    }
  }
  if (params.feedId) {
    var ObjectId = require('mongoose').Types.ObjectId;
    var isValidId = ObjectId.isValid(params.feedId);
    if (!isValidId) {
      errors.push({
        field: "feedId",
        message: "feedId is invalid"
      })
    }
  }
  if (errors.length) {
    res.send({
      success: 0,
      status: 400,
      errors: errors
    });
    return;
  }

  var filters = {
    _id: params.feedId,
    status: 1
  };
  var queryProjection = {
    emotions: 1
  }
  let feedData = await Feed.findOne(filters, queryProjection)
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting feeds data',
        status: false,
        error: error
      })
    })
  if (feedData) {
    var emotions = feedData.emotions;
    if (emotions.length > 0) {

      for (i = 0; i < emotions.length; i++) {
        if (emotions[i].userId == userId) {
          console.log("User emotion found");
          emotions[i].emotion = params.emotion;
          userFoundFlag = true;
          break;
        }
      }
      if (!userFoundFlag) {
        console.log("User emotion not found");
        emotions.push({
          emotion: params.emotion,
          userId: userId
        });
      }
    } else {
      console.log("No emotions are present");
      emotions.push({
        emotion: params.emotion,
        userId: userId
      });
    }
    var updateData = {};
    if (!userFoundFlag) {
      updateData = {
        $inc: {
          noOfLikes: 1
        }
      };
    }

    updateData.emotions = emotions;


    await Feed.update({ _id: params.feedId }, updateData)
      .catch((error) => {
        console.log(error)
        return res.status(200).send({
          message: 'Something went wrong while add emotion',
          status: false,
          error: error
        })
      })

    responseObj = {
      success: 1,
      message: "Emotion added..."
    };
    res.send(responseObj);
    return;

  } else {
    return res.status(200).send({
      message: 'Invalid feed',
      status: false,
    })
  }
}

exports.removeEmotionFromFeed = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;
  var feedId = req.params.id;

  var errors = [];
  if (!feedId) {
    console.log("feedId not found");
    errors.push({
      field: "feedId",
      message: "feedId cannot be empty"
    });
  }
  if (feedId) {
    console.log("feedId found");
    var ObjectId = require('mongoose').Types.ObjectId;
    var isValidId = ObjectId.isValid(feedId);
    if (!isValidId) {
      errors.push({
        field: "feedId",
        message: "feedId is invalid"
      })
    }
  }
  if (errors.length) {
    res.send({
      success: 0,
      status: 400,
      errors: errors
    });
    return;
  }

  var filters = {
    _id: feedId.trim(),
    status: 1
  };
  var queryProjection = {
    emotions: 1
  }
  let feedData = await Feed.findOne(filters, queryProjection)
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting feeds data',
        status: false,
        error: error
      })
    })
  if (feedData) {
    var emotions = feedData.emotions;
    if (emotions.length > 0) {
      pos = emotions.map(function (e) { return e.userId; }).indexOf(userId);
      if (pos > -1) {
        emotions.splice(pos, 1);

        var updateData = {
          $inc: {
            noOfLikes: -1
          },
          emotions
        };


        await Feed.update({ _id: feedId }, updateData)
          .catch((error) => {
            console.log(error)
            return res.status(200).send({
              message: 'Something went wrong while remove emotion',
              status: false,
              error: error
            })
          })

        responseObj = {
          success: 1,
          message: "Emotion removed..."
        };
        res.send(responseObj);
        return;


      } else {
        return res.status(200).send({
          message: 'No emotion found',
          status: false,
        })
      }
    } else {
      return res.status(200).send({
        message: 'No emotions in this feed',
        status: false,
      })
    }
  } else {
    return res.status(200).send({
      message: 'Invalid feed',
      status: false,
    })
  }

}


function isInArray(value, array) {
  return array.indexOf(value) > -1;
}
