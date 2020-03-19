function accountsController(methods, options) {
  var Users = require('../models/user.model.js');
  var jwt = require('jsonwebtoken');
  var config = require('../../config/app.config.js');
  var paramsConfig = require('../../config/params.config');
  const JWT_KEY = paramsConfig.development.jwt.secret;
  var moment = require('moment');
  this.register = (req, res) => {
    var fullName = req.body.fullName;
    var email = req.body.email;
    var password = req.body.password;
    if (!fullName || !email || !password) {
      var errors = [];
      if (!fullName) {
        errors.push({
          field: "fullName",
          message: "FullName cannot be empty"
        });
      }
      if (!email) {
        errors.push({
          field: "email",
          message: "Email cannot be empty"
        });
      }
      if (!password) {
        errors.push({
          field: "password",
          message: "Password cannot be empty"
        });
      }
      return res.send({
        success: 0,
        statusCode: 400,
        errors: errors,
      });
    };
    var findCriteria = {
      email: email,
      password: password
    };
    Users.findOne(findCriteria).then(user => {
      if (user) {
        return res.send({
          success: 0,
          statusCode: 400,
          message: 'User exists, try with another email id'
        })
      }
      const newRegistration = new Users({
        fullName: fullName,
        email: email,
        password: password,
        status: 1,
        tsCreatedAt: Number(moment().unix()),
        tsModifiedAt: null
      });
      newRegistration.save().then(data => {
        res.send({
          success: 1,
          statusCode: 200,
          message: 'User successfully registered'
        })
      })
    })

  };

  this.login = (req, res) => {
    console.log('in login');
    var email = req.body.email;
    var password = req.body.password;
    if (!email || !password) {
      var errors = [];
      if (!email) {
        errors.push({
          field: "email",
          message: "Email cannot be empty"
        });
      }
      if (!password) {
        errors.push({
          field: "password",
          message: "Password cannot be empty"
        });
      }
      return res.send({
        success: 0,
        statusCode: 400,
        errors: errors,
      });
    };
    var findCriteria = {
      email: email,
      password: password
    }
    Users.findOne(findCriteria).then(data => {
      if (!data) {
        return res.send({
          success: 0,
          statusCode: 400,
          message: 'Incorrect credentials'
        })
      };
      var payload = {
        id: data._id,
        fullName: data.fullName,
        email: data.email
      };
      var token = jwt.sign({
        data: payload,
      }, JWT_KEY, {
        expiresIn: '10h'
      });
      res.send({
        success: 1,
        token: token,
        userDetails: payload,
        message: 'Successfully logged in'
      })

    })
  }
}
module.exports = accountsController
