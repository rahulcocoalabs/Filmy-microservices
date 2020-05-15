// function connectionsController(methods, options) {
    var ObjectId = require('mongoose').Types.ObjectId;
    var constants = require('../helpers/constants');
    var Users = require('../models/user.model');

    exports.updateConnection = async (req, res) => {
        let userData = req.user;
        let senderUserId = userData.id;
        // let senderUserId = '5e736a610c01be1e4540d9ff';
        let params = req.body;
        let receiverUserId = params.receiverUserId;
        let connectionStatus = params.connectionStatus;

        var isValidId = ObjectId.isValid(receiverUserId);
        if (!isValidId) {
            var responseObj = {
                success: 0,
                status: 400,
                errors: [{
                    field: "id",
                    message: "receiverUserId is invalid"
                }]
            }
            res.send(responseObj);
            return;
        }
        if (senderUserId === receiverUserId) {
            return res.status(400).json({
                alreadyfollow: "You cannot " + connectionStatus + " yourself"
            })
        }
        if (connectionStatus === constants.FOLLOW_STATUS || connectionStatus === constants.UN_FOLLOW_STATUS) {
            let responseObj = {};
            let receiverData = await Users.findOne({
                _id: ObjectId(receiverUserId),
                status: 1
            });
            let senderData = await Users.findOne({
                _id: ObjectId(senderUserId),
                status: 1
            });
            if (senderData === null) {
                return res.send({
                    success: 0,
                    statusCode: 400,
                    message: "Invalid follower"
                })
            }
            if (receiverData === null) {
                return res.send({
                    success: 0,
                    statusCode: 400,
                    message: "Invalid followee"

                })
            }
            if (connectionStatus === constants.FOLLOW_STATUS) {
                console.log("receiverUserId : " + receiverUserId)
                let id = receiverData.followers.find(o => o === senderUserId);
                if (id) {
                    return res.send({
                        success: 0,
                        statusCode: 400,
                        message: 'Already followed ' + receiverData.fullName
                    })
                } else {
                    receiverData.followers.push(senderUserId);
                    await receiverData.save();
                    senderData.followings.push(receiverUserId);
                    await senderData.save();
                    responseObj = {
                        message: "You followed " + receiverData.fullName,
                        status: 1
                    }
                    return res.send(responseObj);
                }


            } else if (connectionStatus === constants.UN_FOLLOW_STATUS) {
                let id = receiverData.followers.find(o => o === senderUserId);
                if (!id) {
                    return res.send({
                        success: 0,
                        statusCode: 400,
                        message: 'Already unfollowed ' + receiverData.fullName
                    })
                } else {
                    receiverData.followers = receiverData.followers.filter(e => e !== senderUserId); 
                    await receiverData.save();

                    senderData.followings = senderData.followings.filter(e => e !== receiverUserId); 
                    await senderData.save();

                    responseObj = {
                        message: "You unfollowed " + receiverData.fullName,
                        success: 1
                    }
                    return res.send(responseObj);
                }
            }
        } else {
            responseObj = {
                message: "Invalid connection status ",
                success: 0,
                statusCode: 400,

            }
            return res.send(responseObj);
        }

    }

    exports.listFollowers = async (req, res) => {
        let userData = req.user;
        let userId = userData.id;
        let data = await Users.findById(userId)
        .populate('followers')
        .catch((error) => {
            console.log(error)
            return res.status(200).send({
                message: 'Something went wrong while retrieving user',
                status: false,
                error: error
            })
        })
        let i = 0;
        await Promise.all(data.followers.map(async (follower) => {
            let optionObj = await data.followings.find(o => o._id === follower._id);
            if(optionObj){
                console.log("followed")
             data.followers[i].is_follow = true;
            }else{
                console.log("not followed")

             data.followers[i].is_follow = false;
            }
            i = i + 1
        }));

       return res.send(data);

    }


    
    exports.listFollowings = async (req, res) => {
        let userData = req.user;
        let userId = userData.id;
        let data = await Users.findById(userId)
        .populate('followings')
        .catch((error) => {
            console.log(error)
            return res.status(200).send({
                message: 'Something went wrong while retrieving user',
                status: false,
                error: error
            })
        })
        let i = 0;
        await Promise.all(data.followers.map(async (follower) => {
            let optionObj = await data.followings.find(o => o._id === follower._id);
            if(optionObj){
                console.log("followed")
             data.followers[i].is_follow = true;
            }else{
                console.log("not followed")

             data.followers[i].is_follow = false;
            }
            i = i + 1
        }));

       return res.send(data);

    }


    exports.listAutoComplete = async (req,res) =>{
        let userData = req.user;
        let userId = userData.id;
        let type = req.query.type;
        let search = req.query.search;

        if(type === constants.FOLLOWING_SEARCH){
        let data = await Users.findById(userId)
        .populate({ 
            path  : 'followings',
            match : {
      fullName: { $regex: new RegExp(search, "i") } 
            },
            select : '_id fullName profession image'
                      
            }
        )
        .catch((error) => {
            console.log(error)
            return res.status(200).send({
                message: 'Something went wrong while retrieving user',
                status: false,
                error: error
            })
        })
        let followings = data.followings;
        let responseObj = {
            list : followings
        }
       return res.send(responseObj);

        
    }else if(type === constants.FOLLOWER_SEARCH){
     let data = await Users.findById(userId)
        .populate({ 
            path  : 'followers',
            match : {
                fullName: { $regex: new RegExp(search, "i") } 
            },
            select : '_id fullName profession image'
            // options: { sort: { fullName: 1 }
            // }
        }
        )
        .catch((error) => {
            console.log(error)
            return res.status(200).send({
                message: 'Something went wrong while retrieving user',
                status: false,
                error: error
            })
        })
        if(data){
        let followers = data.followers;
        let responseObj = {
            list : followers
        }
       return res.send(responseObj);
        }
    }
}
// }
// module.exports = connectionsController