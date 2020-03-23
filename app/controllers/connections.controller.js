function connectionsController(methods, options) {
    var ObjectId = require('mongoose').Types.ObjectId;
    var constants = require('../helpers/constants');
    var Users = require('../models/user.model');

    this.updateConnection = async (req, res) => {
        let userData = req.identity.data;
        let userId = userData.id;
        // let senderUserId = '5e736a610c01be1e4540d9ff';
        let params = req.body;
        let receiverUserId = params.receiverUserId;
        let connectionStatus = params.connectionStatus;

        var isValidId = ObjectId.isValid(receiverUserId);
        if (!isValidId) {
            var responseObj = {
                success: 0,
                status: 401,
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
                    statusCode: 401,
                    message: "Invalid follower"
                })
            }
            if (receiverData === null) {
                return res.send({
                    success: 0,
                    statusCode: 401,
                    message: "Invalid followee"

                })
            }
            if (connectionStatus === constants.FOLLOW_STATUS) {
                console.log("receiverUserId : " + receiverUserId)
                let id = receiverData.followers.find(o => o === senderUserId);
                if (id) {
                    return res.send({
                        success: 0,
                        statusCode: 401,
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
                        statusCode: 401,
                        message: 'Already unfollowed ' + receiverData.fullName
                    })
                } else {
                    receiverData.followers = receiverData.followers.filter(e => e !== senderUserId); 
                    await receiverData.save();

                    senderData.followings = senderData.followings.filter(e => e !== receiverUserId); 
                    await senderData.save();

                    responseObj = {
                        message: "You unfollowed " + receiverData.fullName,
                        status: 1
                    }
                    return res.send(responseObj);
                }
            }
        } else {

        }

    }
}
module.exports = connectionsController