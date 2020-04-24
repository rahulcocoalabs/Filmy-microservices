const auth = require('../middleware/auth.js');

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
  app.patch('/accounts/update-profile',auth,accounts.updateProfile);
  app.post('/accounts/contact-us',accounts.contactUs);
}




