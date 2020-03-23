var server = require('./server.js'); 
var routes = ['feeds'];
var serviceName = "feeds";
server.start(serviceName, routes);