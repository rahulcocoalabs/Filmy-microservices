module.exports = (app,methods,options) => {
    const accounts = methods.loadController('accounts',options);
    accounts.methods.post('/register',accounts.register, {auth:false});
    accounts.methods.post('/login',accounts.login, {auth:false});
    
}