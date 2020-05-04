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
  }
  if (req.files.videos) {
    console.log(req.files.videos);
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
    console.log(req.files.audios);
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
   

await User.update({_id: userId}, upsertData)
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
      statusCode: 401,
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
  var feedData = await Feed.findById({ _id : feedId}).lean()
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
    if(JSON.stringify(feedData.userId) === JSON.stringify(userId)){

    let update = {};
    if (content) {
      update.content = content;

    }
    if (req.files.images) {
      console.log("Image field detected");
      // type = "image";
      var len = files.images.length;
      var i = 0;
      var oldLeng = oldImagesData.length ;
      if(oldLeng !== len){
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
      var oldLeng = oldVideosData.length ;
      var i = 0;
      if(oldLeng !== len){
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
      var oldLeng = oldAudiosData.length ;
      if(oldLeng !== len){
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


    let feedData = await Feed.update({_id : feedId},update)
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
     
  
  await User.update({_id: userId}, upsertData)
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

exports.getYourFeeds = async (req,res) => {
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
  var findCriteria = {
    userId,
    status : 1
  };
 let yourFeedData = await Feed.find(findCriteria)
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
      imageBase: feedsConfig.imageBase,
      videoBase: feedsConfig.videoBase,
      audioBase: feedsConfig.audioBase,
      items: yourFeedData,
      count : yourFeedsCount,
      totalPages,
      hasNextPage,
    })
  }else{
    return res.send({
      success: 0,
      statusCode: 401,
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
 let homeFeedData = await Feed.find(findCriteria)
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
      imageBase: feedsConfig.imageBase,
      videoBase: feedsConfig.videoBase,
      audioBase: feedsConfig.audioBase,
      items: homeFeedData,
      count : homeFeedsCount,
      totalPages,
      hasNextPage,
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
    $inc: {
      noOfFeeds: -1,
      noOfImages: (feedData.images.length * -1),
      noOfVideos: (feedData.videos.length * -1),
      noOfAudios:  (feedData.audios.length * -1),
    }
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



exports.getFeedsAlbum = async (req,res) => {
  var userData = req.user;
  var userId = userData.id;
  var params = req.query;
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
    let page = params.page || 1;
    let perPage = Number(params.perPage) || 10;
    perPage = perPage > 0 ? perPage : 10;
    var offset = (page - 1) * perPage;
    console.log("offset : " + offset)
    console.log("perPage : " + perPage)
   if(params.type === constants.ALBUM_IMAGE){
     let imageData = await Feed.aggregate([
      { $match : { userId :  ObjectId(userId), status : 1  } },
      // { $unwind : "$images" } ,
      // { $limit : perPage},{ $skip : offset },

      { $project : { _id: 0,'feedId':'$_id','image':'$images.fileName'} } ,
      {
        $facet: {
          edges: [
            // { $sort: sort },
            { $skip: offset },
            { $limit: perPage },
          ],
          pageInfo: [
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
        },
      }
     ])
     .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting feeds image data',
        status: false,
        error: error
      })
    })
   let totalImageCount =  usersData.noOfImages;
   totalPages = totalImageCount / perPage;
   totalPages = Math.ceil(totalPages);
   var hasNextPage = page < totalPages;

   return  res.send({
      success: 1,
      statusCode: 200,
      items: imageData,
      count : totalImageCount,
      totalPages,
      hasNextPage,
      message: 'Images listed successfully'
    })
   }else if(params.type === constants.ALBUM_VIDEO){
    let videoData = await Feed.aggregate([
      { $match : { userId :  ObjectId(userId),status : 1  } },
      { $unwind : "$videos" } ,
      { $limit : perPage},{ $skip : offset },
      { $project : { _id: 0,'feedId':'$_id','video':'$videos.fileName'} } 
     ])
     .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting feeds videos data',
        status: false,
        error: error
      })
    })
   let totalVideoCount =  usersData.noOfVideos;
   totalPages = totalVideoCount / perPage;
   totalPages = Math.ceil(totalPages);
   var hasNextPage = page < totalPages;

   return  res.send({
      success: 1,
      statusCode: 200,
      items: videoData,
      count : totalVideoCount,
      totalPages,
      hasNextPage,
      message: 'Videos listed successfully'
    })

   }else if(params.type === constants.ALBUM_AUDIO){
    let audioData = await Feed.aggregate([
      { $match : { userId :  ObjectId(userId), status : 1 } },
      { $unwind : "$audios" } ,
      { $limit : perPage},{ $skip : offset },
      { $project : { _id: 0,'feedId':'$_id','video':'$audios.fileName'} } 
     ])
     .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting feeds audios data',
        status: false,
        error: error
      })
    })
   let totalAudioCount =  usersData.noOfAudios;
   totalPages = totalAudioCount / perPage;
   totalPages = Math.ceil(totalPages);
   var hasNextPage = page < totalPages;

   return  res.send({
      success: 1,
      statusCode: 200,
      items: audioData,
      count : totalAudioCount,
      totalPages,
      hasNextPage,
      message: 'Audios listed successfully'
    })


   }
    


  }
}



exports.deleteFeedsAlbum = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;
  var feedId = req.params.id;
  // var type = 
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
    $inc: {
      noOfFeeds: -1,
      noOfImages: (feedData.images.length * -1),
      noOfVideos: (feedData.videos.length * -1),
      noOfAudios:  (feedData.audios.length * -1),
    }
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