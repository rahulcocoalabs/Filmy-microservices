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
      console.log(data);
      console.log('data');
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
        email: data.email,
        phone: null,
        image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
        location: null,
        bio: null,
        dateOfBirth: null,
        height: null,
        weight: null,
        tagLine: null,
        skills: [],
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
        //Redirect user to form with the email address
        // res.render('reset', {user});
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

  // *** change password ***

  this.changePassword = async (req, res) => {
    var userData = req.identity.data;
    var userId = userData.id;
    var email = req.body.email;
    var currentPassword = req.body.currentPassword;
    var newPassword = req.body.newPassword;
    var confirmPassword = req.body.confirmPassword;
    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      var errors = [];
      if (!email) {
        errors.push({
          field: "email",
          message: "Email cannot be empty"
        });
      };
      if (!currentPassword) {
        errors.push({
          field: "currentPassword",
          message: "Current password cannot be empty"
        });
      };
      if (!newPassword) {
        errors.push({
          field: "newPassword",
          message: "New password cannot be empty"
        });
      };
      if (!confirmPassword) {
        errors.push({
          field: "confirmPassword",
          message: "confirm password cannot be empty"
        });
      };
      return res.send({
        success: 0,
        statusCode: 400,
        errors: errors,
      });
    };

    var checkMail = await Users.findOne({
      _id: userId,
      email: email
    })
    if (!checkMail) {
      return res.send({
        success: 0,
        message: 'Please enter your registered mail id'
      })
    };
    var currentPasswordCheckData = await Users.findOne({
      _id: userId,
      email: email
    });
    var currentPasswordCheck = currentPasswordCheckData.password;

    if (currentPassword != currentPasswordCheck) {
      return res.send({
        success: 0,
        message: 'Current Password is incorrect'
      })
    };

    if (newPassword != confirmPassword) {
      return res.send({
        success: 0,
        message: 'Both new password and retyped password should be same'
      })
    };

    var filter = {
      _id: userId,
      email: email,
      currentPassword: currentPassword
    };

    var update = {
      password: newPassword
    };

    Users.update(filter, update).then(data => {
      res.send({
        success: 1,
        statusCode: 200,
        message: 'Password updated successfully'
      })
    }).catch(err => {
      res.send({
        success: 0,
        message: err.message
      })
    })


  }

  this.updateProfile = (req, res) => {
    var userData = req.identity.data;
    var userId = userData.id;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var dateOfBirth = req.body.dateOfBirth;
    var gender = req.body.gender;
    var profession = req.body.profession;
    var phone = req.body.phone;
    var city = req.body.city;
    var country = req.body.country;
    var languagesKnown = req.body.languagesKnown;
    var skills = req.body.skills;
    var bio = req.body.bio;
    var tagLine = req.body.tagLine;
    if (!firstName && !lastName && !dateOfBirth && !gender && !profession && !phone && !city && !country && !languagesKnown && !skills && !bio && !tagLine) {
      return res.send({
        success: 0,
        statusCode: 204,
        message: 'Nothing to update'
      })
    }
    var update = {};
    if (firstName) {
      update.fullName = firstName
    };
    if (lastName) {
      update.fullName = lastName
    };
    if (firstName && lastName) {
      update.fullName = firstName + ' ' + lastName
    }
    if (dateOfBirth) {
      update.dateOfBirth = dateOfBirth
    };
    if (gender) {
      update.gender = gender
    };
    if (profession) {
      update.profession = profession
    };
    if (phone) {
      update.phone = phone
    };
    if (city) {
      update.city = city
    };
    if (country) {
      update.country = country
    };
    if (languagesKnown) {
      update.languagesKnown = languagesKnown
    };
    if (skills) {
      update.skills = skills
    };
    if (bio) {
      update.bio = bio
    };
    if (tagLine) {
      update.tagLine = tagLine
    };
    var filter = {
      _id: userId
    };
    Users.findOneAndUpdate(filter, update, {
      new: true,
      useFindAndModify: false
    }).then(result => {
      res.send({
        success: 1,
        statusCode: 200,
        message: 'User data updated successfully'
      })
    }).catch(err => {
      return res.send({
        success: 0,
        statusCode: 500,
        message: err.message,
      })
    });
  }

}
module.exports = accountsController
