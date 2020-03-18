module.exports = (app,methods,options) => {
    const sample = methods.loadController('users',options);
    sample.methods.get('/test',sample.test, {auth:false});
    
}