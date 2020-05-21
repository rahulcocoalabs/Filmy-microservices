const auth = require('../middleware/auth.js');

var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var articlesConfig = config.articles;


var storage = multer.diskStorage({
    destination: articlesConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var articleImageUpload = multer({ storage: storage });


module.exports = (app) => {
    const articles = require('../controllers/articles.controller');

   app.post('/articles',auth,articleImageUpload.single('image'),articles.createArticle);
   app.patch('/articles/:id',auth,articleImageUpload.single('image'),articles.updateArticle);
   app.delete('/articles/:id',auth,articles.deleteArticle);
// //    app.get('/feeds/:id',auth,articles.getFeed);
   app.get('/articles',auth,articles.getYourArticles);
   app.get('/articles/home',auth,articles.getHomeArticles);
//    app.get('/feeds/albums',auth,articles.getFeedsAlbum);
//    app.delete('/feeds/albums/delete',auth,articles.deleteFeedsAlbum);
// //    app.delete('/feeds/albums/:id',auth,articles.deleteFeedsAlbum);



   app.post('/articles/emotion',auth,articles.addEmotionToArticle);

//    app.delete('/feeds/emotion/:id',auth,articles.removeEmotionFromFeed);

   app.post('/articles/comment',auth,articles.addComment);
//    app.get('/feeds/comment',auth,articles.getComments);
   app.patch('/articles/comment/:id',auth,articles.updateComment);
//    app.delete('/feeds/comment/:id',auth,articles.deleteComment);
}