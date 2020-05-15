const auth = require('../middleware/auth.js');
var multer = require('multer');
var config = require('../../config/app.config.js');
var profilePath = config.profile;

var storage = multer.diskStorage({
    destination: profilePath.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var userImageUpload = multer({ storage: storage });

module.exports = (app) => {
    // const accounts = methods.loadController('accounts',options);
   const accounts = require('../controllers/accounts.controller');
  app.post('/accounts/register',accounts.register);
  app.post('/accounts/login',accounts.login);
  app.post('/accounts/recover-password',accounts.recover);
  app.get('/accounts/reset/:token',accounts.reset);
  app.post('/accounts/reset-password/:token',accounts.resetPassword);
  app.patch('/accounts/change-password',auth,accounts.changePassword);
  app.get('/accounts/profile',auth,accounts.getProfile);
  app.patch('/accounts/update-profile',auth, userImageUpload.single('image'),accounts.updateProfile);
  app.post('/accounts/contact-us',accounts.contactUs);

  app.get('/accounts/users/auto-complete',auth,accounts.listAutoComplete);
  app.get('/accounts/users/search',auth,accounts.listUsers);
  app.get('/accounts/users/profile/:id',auth,accounts.getUserProfile);
  


}




