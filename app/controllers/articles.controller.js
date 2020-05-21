// function feedsController(methods, options) {
var Article = require('../models/article.model');
var User = require('../models/user.model.js');
var Comments = require('../models/comments.model.js');
var config = require('../../config/app.config.js');
var constants = require('../helpers/constants');
var feedsConfig = config.feeds;
var articlesConfig = config.articles;

var moment = require('moment');
var ObjectId = require('mongoose').Types.ObjectId;

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

exports.createArticle = async (req, res) => {
  var userDatas = req.user;
  var userId = userDatas.id;
  var content = req.body.content;
  var title = req.body.title;
  var image = req.file.filename;

  if (!content & !image && !title) {
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'Feed cannot be empty'
    })
  };
  let userData = await User.findById(userId)
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting user data',
        status: false,
        error: error
      })
    })
  if (userData) {
    console.log("image")
    console.log(image)
    console.log("image")
    const article = new Article({
      userId,
      title,
      content,
      image,
      status: 1,
      tsCreatedAt: Number(moment().unix()),
      tsModifiedAt: null
    })



    let articleData = await article.save()
      .catch((error) => {
        console.log(error)
        return res.status(200).send({
          message: 'Something went wrong while posting article',
          status: false,
          error: error
        })
      })
    return res.send({
      success: 1,
      statusCode: 200,
      message: 'Article added successfully'
    })
  } else {
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'Invalid user'
    })
  }

}

exports.updateArticle = async (req, res) => {
  var userDatas = req.user;
  var userId = userDatas.id;
  var articleId = req.params.id;
  var content = req.body.content;
  var title = req.body.title;
  var image;

  if (req.file && req.file.filename) {
    image = req.file.filename;
  }

  if (!content && !title && !image) {
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'Nothing to update'
    })
  };

  var articleData = await Article.findOne({ _id: articleId, status: 1 }).lean()
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while posting feed',
        status: false,
        error: error
      })
    })
  if (articleData) {
    if (JSON.stringify(articleData.userId) === JSON.stringify(userId)) {
      var update = {};
      if (image) {
        update.image = image;
      }
      if (title) {
        update.title = title;
      }
      if (content) {
        update.content = content;
      }
      update.tsModifiedAt = moment().unix();

      let articleData = await Article.update({ _id: articleId }, update)
        .catch((error) => {
          console.log(error)
          return res.status(200).send({
            message: 'Something went wrong while updating article',
            status: false,
            error: error
          })
        })
      return res.send({
        success: 1,
        statusCode: 200,
        message: 'You have updated article successfully'
      })
    } else {
      return res.send({
        success: 0,
        statusCode: 400,
        message: 'Its not your article'
      })
    }
  } else {
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'Invalid article'
    })
  }
}

exports.deleteArticle = async(req,res) =>{
  console.log("req.user")
  console.log(req.user)
  console.log("req.user")
  var userData = req.user;
  var userId = userData.id;
  var articleId = req.params.id;
  let articleData = await Article.findOne({
    _id: articleId,
    userId,
    status: 1
  })
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting article',
        status: false,
        error: error
      })
    })

  if (articleData) {
    if (JSON.stringify(articleData.userId) === JSON.stringify(userId)) {

    let updateData = await Article.update({ _id: articleId }, {
      status: 0
    })
      .catch((error) => {
        console.log(error)
        return res.status(200).send({
          message: 'Something went wrong while deleting a article',
          status: false,
          error: error
        })
      })
    }else{
      return res.send({
        success: 0,
        statusCode: 400,
        message: 'Its not your article'
      })
    }
    return res.send({
      success: 1,
      statusCode: 200,
      message: 'You have deleted an article successfully'
    })
  }else{
    return res.send({
      success: 0,
      statusCode: 400,
      message: 'Invalid article'
    })
  }
}

exports.getYourArticles = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;

  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || articlesConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : articlesConfig.resultsPerPage;
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
    let yourArticleData = await Article.find(findCriteria)
      // .populate({
      //   path: 'userId',
      //   select: '_id fullName profession image'
      // }
      // )
      .limit(perPage)
      .skip(offset)
      .sort({
        'tsCreatedAt': -1
      })
      .catch((error) => {
        console.log(error)
        return res.status(200).send({
          message: 'Something went wrong while getting your article data',
          status: false,
          error: error
        })
      })

    let yourArticlesCount = await Article.count(findCriteria)
      .sort({
        'tsCreatedAt': -1
      })
      .catch((error) => {
        console.log(error)
        return res.status(200).send({
          message: 'Something went wrong while getting your article count',
          status: false,
          error: error
        })
      })

      // let data = []
      // await Promise.all(yourFeedData.map(async (item) => {
      //   let obj = JSON.parse(JSON.stringify(item));
      //   obj.yourEmotion = ""
        
      // pos =  item.emotions.map(function (e) { return e.userId; }).indexOf(ObjectId(userId));
      // console.log("pos : " + pos);
      // if(pos > -1){
      //   obj.yourEmotion = item.emotions[pos].emotion;
      // }
      // data.push(obj);
      // // homeFeedData[i] = obj;
     
      // }));

    let totalPages = yourArticlesCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    res.send({
      success: 1,
      statusCode: 200,
      message: 'Articles listed successfully',
      // imageBase: feedsConfig.imageBase,
      // videoBase: feedsConfig.videoBase,
      // audioBase: feedsConfig.audioBase,
      // items: data,
      items: yourArticleData,
      count: yourArticlesCount,
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



exports.getHomeArticles = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;

  var params = req.query;
  var page = params.page || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || articlesConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : articlesConfig.resultsPerPage;
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
    let homeArticleData = await Article.find(findCriteria)
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
          message: 'Something went wrong while getting article data',
          status: false,
          error: error
        })
      })

    let homeArticlesCount = await Article.count(findCriteria)
      .catch((error) => {
        console.log(error)
        return res.status(200).send({
          message: 'Something went wrong while getting your articles count',
          status: false,
          error: error
        })
      })
      // let data = []
      // await Promise.all(homeFeedData.map(async (item) => {
      //   let obj = JSON.parse(JSON.stringify(item));
      //   obj.yourEmotion = ""
        
      // pos =  item.emotions.map(function (e) { return e.userId; }).indexOf(ObjectId(userId));
      // console.log("pos : " + pos);
      // if(pos > -1){
      //   obj.yourEmotion = item.emotions[pos].emotion;
      // }
      // data.push(obj);
      // // homeFeedData[i] = obj;
      
      // }));

    let totalPages = homeArticlesCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;

    res.send({
      success: 1,
      statusCode: 200,
      message: 'Articles listed successfully',
      // imageBase: feedsConfig.imageBase,
      // videoBase: feedsConfig.videoBase,
      // audioBase: feedsConfig.audioBase,
      items: homeArticleData,
      // items: data,
      count: homeArticlesCount,
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

exports.addEmotionToArticle = async (req, res) => {
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
  if (!params.articleId) {
    errors.push({
      field: "articleId",
      message: "articleId cannot be empty"
    });
  }
  if(params.emotion !== constants.UNLIKE_STATUS){
  if (params.emotion) {
    if (!isInArray(params.emotion, articlesConfig.emotionsList)) {
      errors.push({
        field: "emotion",
        message: "Invalid emotion"
      });
    }
  }
  if (params.articleId) {
    var ObjectId = require('mongoose').Types.ObjectId;
    var isValidId = ObjectId.isValid(params.articleId);
    if (!isValidId) {
      errors.push({
        field: "articleId",
        message: "articleId is invalid"
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
    _id: params.articleId,
    status: 1
  };
  var queryProjection = {
    emotions: 1
  }
  let articleData = await Article.findOne(filters, queryProjection)
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting articles data',
        status: false,
        error: error
      })
    })
  if (articleData) {
    var emotions = articleData.emotions;
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


    await Article.update({ _id: params.articleId }, updateData)
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
      message: 'Invalid article',
      status: false,
    })
  }
}else{

  var filters = {
    _id: params.articleId.trim(),
    status: 1
  };
  var queryProjection = {
    emotions: 1
  }
  let articleData = await Article.findOne(filters, queryProjection)
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting articles data',
        status: false,
        error: error
      })
    })
  if (articleData) {
    var emotions = articleData.emotions;
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


        await Article.update({ _id: params.articleId }, updateData)
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
        message: 'No emotions in this article',
        status: false,
      })
    }
  } else {
    return res.status(200).send({
      message: 'Invalid article',
      status: false,
    })
  }


}
}

exports.addComment = async (req, res) => {
  console.log('in add comment');
  var userData = req.user;
  var userId = userData.id;
  var articleId = req.body.articleId;
  var commentId = req.body.commentId;
  var comment = req.body.comment;

  if (!articleId || !comment) {
    var errors = [];

    if (!articleId) {
      errors.push({
        field: "articleId",
        message: 'Require articleId'

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

  var isValidId = ObjectId.isValid(articleId);

  if (!isValidId) {
    var responseObj = {
      success: 0,
      status: 400,
      errors: {
        field: "articleId",
        message: "articleId is invalid"
      }
    }
    res.send(responseObj);
    return;
  }
  var filters = {
    _id: articleId,
    status: 1
  };
  var queryProjection = {
    commentsIds: 1,
    _id: 1
  }
  let articleData = await Article.findOne(filters, queryProjection)
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting articles data',
        status: false,
        error: error
      })
    })

  if (articleData) {
    if (commentId) {
      var filters = {
        _id: commentId,
        type: constants.ARTICLE_COMMENT,
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


      await Comments.update({ _id: commentId, type: constants.ARTICLE_COMMENT }, updateData)
        .catch((error) => {
          console.log(error)
          return res.status(200).send({
            message: 'Something went wrong while reply update',
            status: false,
            error: error
          })
        })

      var upsertData = {
        $inc: {
          noOfComments: 1,
        }
      };

      await Article.update({ _id: articleId, status: 1 }, upsertData)
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



    } else {

      var newComments = new Comments({
        userId,
        articleId,
        type: constants.ARTICLE_COMMENT,
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

      await Article.update({ _id: articleId, status: 1 }, upsertData)
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
      message: 'Invalid article'
    })
  }

};



exports.updateComment = async (req, res) => {
  var userData = req.user;
  var userId = userData.id;
  var articleId = req.body.articleId;
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

  var isValidArticleId = ObjectId.isValid(articleId);
  var isValidCommentId = ObjectId.isValid(commentId);

  if (!isValidArticleId || !isValidCommentId) {
    var errors = [];

    if (!isValidArticleId) {
      errors.push({
        field: "articleId",
        message: 'Invalid articleId'

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
    _id: articleId,
    status: 1
  };
  var queryProjection = {
    commentsIds: 1,
    _id: 1
  }
  let articleData = await Article.findOne(filters, queryProjection)
    .catch((error) => {
      console.log(error)
      return res.status(200).send({
        message: 'Something went wrong while getting articles data',
        status: false,
        error: error
      })
    })
  if (articleData) {

    var filters = {
      _id: commentId,
      userId,
      type: constants.ARTICLE_COMMENT,
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
          message: 'Something went wrong while getting comments data',
          status: false,
          error: error
        })
      })
    if (commentData) {
      if (replyCommentId) {
        var replies = [];
        replies = commentData.replies;
        pos = replies.map(function (e) { return e._id; }).indexOf(replyCommentId);
        if (pos > -1) {
          replies[pos].comment = comment;
          replies[pos].tsModifiedAt = Number(moment().unix());
          var updateComment = {};
          updateComment.replies = replies;

          await Comments.update({
            _id: commentId,
            type: constants.ARTICLE_COMMENT,
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


        } else {
          return res.send({
            success: 0,
            statusCode: 400,
            message: 'Reply comment not exists'
          })
        }

      } else {
        var updateComment = {
          comment,
          tsModifiedAt: Number(moment().unix())
        };

        await Comments.update({
          _id: commentId,
          userId,
          type: constants.ARTICLE_COMMENT,
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
      message: 'Invalid article'
    })
  }

}










