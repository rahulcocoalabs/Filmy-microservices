const jwt = require('jsonwebtoken')
const User = require('../models/user.model.js');
// var config = require('../../config/app.config.js');
var paramsConfig = require('../../config/params.config');

const JWT_KEY = paramsConfig.development.jwt.secret;


const auth = async(req, res, next) => {   
    try {
        console.log("haai")
        // const token = req.header('Authorization').trim();
        // const token = req.headers.authorization.split(" ")[1];

        const token = req.header('Authorization').replace('bearer ', '')

        const userDetails = jwt.verify(token, JWT_KEY);
   
        const data = userDetails.data;
        const userId = data.id;
        const user = await User.findOne({ _id: userId });
        console.log(user);
        if (!user) {
            throw new Error()
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        console.log("error")
        console.log(error)
        console.log("error")
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
module.exports = auth