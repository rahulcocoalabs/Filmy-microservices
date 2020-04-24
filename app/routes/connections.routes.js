const auth = require('../middleware/auth.js');


module.exports = (app) => {
    const connections = require('../controllers/connections.controller');

    app.post('/connections/update-status',auth,connections.updateConnection);
  
}
