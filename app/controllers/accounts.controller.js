function accountsController(methods, options) {
  var Users = require('../models/user.model.js');
  var jwt = require('jsonwebtoken');
  var config = require('../../config/app.config.js');
  var paramsConfig = require('../../config/params.config');
  const JWT_KEY = paramsConfig.development.jwt.secret;
  var moment = require('moment');
  const crypto = require('crypto');
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
      email: email
    };
    Users.findOne(findCriteria).then(user => {
      if (user) {
        return res.send({
          success: 0,
          statusCode: 401,
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
          statusCode: 401,
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
        statusCode: 200,
        token: token,
        userDetails: payload,
        message: 'Successfully logged in'
      })

    })
  };

  this.recover = (req, res) => {
    var email = req.body.email;
    var findCriteria = {
      email: email
    }
    Users.findOne(findCriteria).then(user => {
        if (!user) {
          return res.send({
            success: 0,
            statusCode: 401,
            message: 'The email address ' + email + ' is not associated with any account. Double-check your email address and try again.'
          })
        };
        var resetPasswordToken = crypto.randomBytes(20).toString('hex');
        var resetPasswordExpires = Date.now() + 3600000; //expires in an hour
        var filter = {
          email: email
        };
        var update = {
          resetPasswordToken: resetPasswordToken,
          resetPasswordExpires: resetPasswordExpires
        };
        Users.findOneAndUpdate(filter, update, {
            new: true,
            useFindAndModify: false
          }).then(user => {
            let link = "http://" + req.headers.host + "/accounts/reset/" + user.resetPasswordToken;
            const mailOptions = {
              to: user.email,
              from: 'Filmy@example.com',
              subject: "Password change request",
              text: `Hi ${user.fullName} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
            };
            sgMail.send(mailOptions, (error, result) => {
              if (error) {
                return res.status(500).send({
                  success: 0,
                  message: error.message
                });
              }
              res.send({
                success: 1,
                statusCode: 200,
                message: 'A reset email has been sent to ' + user.email + '.'
              });
            })
          })
          .catch(err => res.status(500).send({
            success: 0,
            message: err.message
          }));
      })
      .catch(err => res.status(500).send({
        success: 0,
        message: err.message
      }));
  };

  this.reset = (req, res) => {
    Users.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      })
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            message: 'Password reset token is invalid or has expired.'
          });
        }
        res.send({
          success: 1,
          statusCode: 200,
          message: 'Reset token is valid and you can redirect to password reset page'
        })
      })
      .catch(err => res.status(500).json({
        message: err.message
      }));
  };

  this.resetPassword = (req, res) => {
    Users.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      })
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            success: 0,
            message: 'Password reset token is invalid or has expired.'
          });
        }

        //Set the new password
        var update = {
          password: req.body.password,
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        };
        var filter = {
          resetPasswordToken: req.params.token
        };
        Users.findOneAndUpdate(filter, update, {
            new: true,
            useFindAndModify: false
        }).then(user => {
          // send email
          const mailOptions = {
            to: user.email,
            from: 'test@example.com',
            subject: "Your password has been changed",
            text: `Hi ${user.fullName} \n 
                    This is a confirmation that the password for your account ${user.email} has just been changed.\n`
          };

          sgMail.send(mailOptions, (error, result) => {
            if (error) return res.status(500).json({
              success: 0,
              message: error.message
            });

            res.status(200).json({
              success: 1,
              message: 'Your password has been updated.'
            });
          });
        }).catch(err => res.status(500).json({
          success: 0,
          message: err.message
        }));
      });
  };

}
module.exports = accountsController
