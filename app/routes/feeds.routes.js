const auth = require('../middleware/auth.js');

var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var feedsConfig = config.feeds;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("----------------------------")
        console.log("file")
        console.log(file)
        console.log("file")
        if (file.fieldname === "images"){
            console.log("inside image")
            cb(null, feedsConfig.imageUploadPath.trim());
        } else if (file.fieldname === "videos"){
            console.log("inside videos")
            cb(null, feedsConfig.videoUploadPath.trim());
        } else if (file.fieldname === "audios"){
            console.log("inside audios")
            cb(null, feedsConfig.audioUploadPath.trim());
        }else{
            return cb({success: 0, message: "Invalid types" });
        }
        console.log("----------------------------")

        // if (!req.files.images && !req.files.videos) {
        //     return cb({success: 0, message: "You cannot " });
        // }
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
   app.get('/feeds/home',auth,feeds.getHomeFeeds);
   app.get('/feeds/albums',auth,feeds.getFeedsAlbum);

   app.post('/feeds/add-comment',auth,feeds.addComment);
   app.get('/feeds/get-comment/:postId',auth,feeds.getComment);
}