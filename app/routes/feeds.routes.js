module.exports = (app,methods,options) => {
    const accounts = methods.loadController('feeds',options);
    accounts.methods.post('/register',accounts.register, {auth:false});
}