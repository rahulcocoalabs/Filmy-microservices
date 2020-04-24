const auth = require('../middleware/auth.js');

var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var feedsConfig = config.feeds;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (req.files.images)
            cb(null, feedsConfig.imageUploadPath.trim());
        if (req.files.videos)
            cb(null, feedsConfig.videoUploadPath.trim());
        // if (!req.files.images && !req.files.videos && req.files.documents)
        //     cb(null, feedsConfig.documentUploadPath);
        // if (!req.files.images && !req.files.videos) {
        //     return cb({success: 0, message: "You cannot " });
        // }
    },
    filename: function (req, file, cb) {
        console.log("file.mimetype :" )
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err)
                return cb(err)
                // console.log("raw.toString('hex')")
                // console.log(raw.toString('hex')+ "." + mime.extension(file.mimetype));
                // console.log("raw.toString('hex')")
              let  filename = raw.toString('hex')+ "." + mime.extension(file.mimetype).trim();
            cb(null, filename)
        })
    }
});

var feedsUpload = multer({ storage: storage });


module.exports = (app) => {
    const feeds = require('../controllers/feed.controller');

   app.post('/feeds/create-feed',auth,feedsUpload.fields([{ name: 'images', maxCount: feedsConfig.maxImageCount }, { name: 'documents', maxCount: feedsConfig.maxDocumentsCount }, { name: 'videos', maxCount: feedsConfig.maxVideoCount }]),feeds.createFeed);
   app.get('/feeds/get-feed',auth,feeds.getFeed);
   app.post('/feeds/add-comment',auth,feeds.addComment);
   app.get('/feeds/get-comment/:postId',auth,feeds.getComment);
}