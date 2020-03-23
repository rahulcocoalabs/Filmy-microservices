var server = require('./server.js'); 
var routes = ['connections'];
var serviceName = "connections";
server.start(serviceName, routes);