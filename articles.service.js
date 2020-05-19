var server = require('./server.js'); 
var routes = ['articles'];
var serviceName = "articles";
server.start(serviceName, routes);