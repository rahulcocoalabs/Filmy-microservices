module.exports = (app,methods,options) => {
    const accounts = methods.loadController('accounts',options);
    accounts.methods.post('/register',accounts.register, {auth:false});
    accounts.methods.post('/login',accounts.login, {auth:false});
    accounts.methods.post('/recover-password',accounts.recover, {auth:false});
    accounts.methods.get('/reset/:token',accounts.reset, {auth:false});
    accounts.methods.post('/reset-password/:token',accounts.resetPassword, {auth:false});
    
    
}