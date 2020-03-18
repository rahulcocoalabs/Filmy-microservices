var server = require('./server.js'); 
var routes = ['users'];
var serviceName = "users";
server.start(serviceName, routes);