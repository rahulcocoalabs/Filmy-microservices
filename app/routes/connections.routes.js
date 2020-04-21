module.exports = (app,methods,options) => {
    const connections = methods.loadController('connections',options);
    // connections.methods.post('/send',requests.sendRequest, {auth:true});
    connections.methods.post('/update-status',connections.updateConnection, {auth:true});
  
}