const auth = require('../middleware/auth.js');

var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var feedsConfig = config.feeds;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
     
        if (file.fieldname === "images"){
            cb(null, feedsConfig.imageUploadPath.trim());
        } else if (file.fieldname === "videos"){
            cb(null, feedsConfig.videoUploadPath.trim());
        } else if (file.fieldname === "audios"){
            cb(null, feedsConfig.audioUploadPath.trim());
        }else{
            return cb({success: 0, message: "Invalid types" });
        }
        
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var feedsUpload = multer({ storage: storage });


module.exports = (app) => {
    const feeds = require('../controllers/feeds.controller');

   app.post('/feeds',auth,feedsUpload.fields([{ name: 'images', maxCount: feedsConfig.maxImagesCount }, { name: 'audios', maxCount: feedsConfig.maxAudiosCount }, { name: 'videos', maxCount: feedsConfig.maxVideosCount }]),feeds.createFeed);
   app.patch('/feeds/:id',auth,feedsUpload.fields([{ name: 'images', maxCount: feedsConfig.maxImagesCount }, { name: 'audios', maxCount: feedsConfig.maxAudiosCount }, { name: 'videos', maxCount: feedsConfig.maxVideosCount }]),feeds.updateFeed);
//    app.get('/feeds/:id',auth,feeds.getFeed);
   app.delete('/feeds/:id',auth,feeds.deleteFeed);
   app.get('/feeds',auth,feeds.getYourFeeds);
   app.get('/feeds/home',auth,feeds.getHomeFeeds);
   app.get('/feeds/albums',auth,feeds.getFeedsAlbum);
   app.delete('/feeds/albums/:id',auth,feeds.deleteFeedsAlbum);

   app.post('/feeds/add-comment',auth,feeds.addComment);
   app.get('/feeds/get-comment/:postId',auth,feeds.getComment);
}