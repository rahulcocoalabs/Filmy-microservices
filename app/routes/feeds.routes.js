module.exports = (app,methods,options) => {
    const feeds = methods.loadController('feed',options);
    feeds.methods.post('/create-feed',feeds.createFeed, {auth:true});
    feeds.methods.get('/get-feed',feeds.getFeed, {auth:true});
    feeds.methods.post('/add-comment',feeds.addComment, {auth:true});
    feeds.methods.get('/get-comment/:postId',feeds.getComment, {auth:true});
}