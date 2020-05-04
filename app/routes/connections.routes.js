const auth = require('../middleware/auth.js');


module.exports = (app) => {
    const connections = require('../controllers/connections.controller');

    app.post('/connections/update-status',auth,connections.updateConnection);
    app.get('/connections/followers',auth,connections.listFollowers);
    app.get('/connections/followings',auth,connections.listFollowings);
    app.get('/connections/auto-complete',auth,connections.listAutoComplete);
    // app.get('/connections/followings',auth,connections.listFollowings);
  
}
