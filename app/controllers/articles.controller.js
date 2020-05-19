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