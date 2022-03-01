/* eslint-disable handle-callback-err */
const express = require('express')

const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
// const { session } = require('passport');
const key = require('../config/keys').secret
const User = require('../model/Users')

var count = 0
// Route POST api/users/register
router.post('/register', (req, res) => {
  const {
    // eslint-disable-next-line camelcase
    name, username, email, password, confirm_password, Role, blocked, blockedTime
  } = req.body
  // eslint-disable-next-line camelcase
  if (password !== confirm_password) {
    return res.json({
      success: false,
      msg: 'Password do not match '
    })
  }
  // Check for Unique Username
  User.findOne({
    username
  }).then((user) => {
    if (user) {
      return res.json({
        success: false,
        msg: 'User already Exist '
      })
    } else {
      //  The Data is valid and now we can register
      const newUser = new User({
        name,
        username,
        password,
        email,
        Role,
        blocked,
        blockedTime
      })
      // Generate salt for password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (er, hash) => {
          if (er) {
            throw er
          } else {
            newUser.password = hash
            newUser.save().then((user) => res.status(200).json({
              success: true,
              msg: 'User is now Registered'
            }))
          }
        })
      })
    }
  }).catch((err) => {
    res.send(err)
  })
  // Check for the Unique Email
  User.findOne({
    email
  }).then((user) => {
    if (user) {
      return res.json({
        success: false,
        msg: 'Email already Exist '
      })
    } else {
      //  The Data is valid and now we can register
      const newUser = new User({
        name,
        username,
        password,
        email,
        Role,
        blocked,
        blockedTime
      })
      // Generate salt for password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (er, hash) => {
          if (er) {
            throw er
          } else {
            newUser.password = hash
            newUser.save().then((user) => res.status(200).json({
              success: true,
              msg: 'User is now Registered'
            }))
          }
        })
      })
    }
  }).catch((err) => {
    res.send(err)
  })
})

// Route POST Login

router.post('/login', (req, res) => {
  console.log(req.body.username)
  try {
    User.findOne(
      {
        username: req.body.username
      }
    ).then((user) => {
      if (!user) {
        return res.json({
          msg: 'User is Not Found',
          success: false
        })
      }
      // If the is User then Compare Password

      bcrypt.compare(req.body.password, user.password).then((isMatch) => {
        if (isMatch && !user.blocked) {
          count = 0
          // User's Password is Correct and send JSON Token
          const payload = {
            // eslint-disable-next-line no-underscore-dangle
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            blocked: user.blocked
          }
          jwt.sign(payload, key,
            {
              expiresIn: 604800
            }, (err, token) => {
              res.status(200).json({
                success: true,
                user,
                msg: 'Successfully Signed the token',
                token: `Bearer ${token}`
              })
            })
        } else if (user.blocked) {
          if (user.blockedTime <= Date.now()) {
            console.log(user.blockedTime)
            console.log(Date.now())
            user.blockedTime = new Date(0)
            user.blocked = false
            count = 0
            user.save((err, user) => {
              const payload = {
                // eslint-disable-next-line no-underscore-dangle
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                blocked: user.blocked
              }
              jwt.sign(payload, key,
                {
                  expiresIn: 604800
                }, (err, token) => {
                  res.status(200).json({
                    success: true,
                    user,
                    msg: 'Successfully Signed the token',
                    token: `Bearer ${token}`
                  })
                })
              if (err) {
                return res.json({
                  msg: 'Error Occurred During Unblocking user',
                  success: false
                })
              }
            })
          } else {
            return res.json({
              msg: 'Account Blocked for 5 hours. Please wait for 5 hours and Try again later',
              success: false
            })
          }
        } else if (count === 5) {
          User.findOne({ username: req.body.username }, (error, user) => {
            count = 0
            console.log(user.blocked)
            user.blocked = true
            user.blockedTime = Date.now() + 5 * 60 * 60 * 1000
            user.save((err, updatedUser) => {
              console.log(updatedUser)
              return res.json({
                msg: 'Account Blocked for 5 hours. Try again Later',
                success: false
              })
            })
          })
        } else {
          count = count + 1
          return res.json({
            msg: 'Incorrect Password',
            success: false
          })
        }
      })
    })
  } catch (err) {
    console.log(err)
  }
})
router.post('/deleteUsers', (req, res) => {
  try {
    var users = req.body
    User.deleteOne({ username: users.username }, (err, data) => {
      return res.json({
        msg: 'User Deleted Successfully',
        success: true
      })
    })
  } catch (err) {
    console.log(err)
    return res.json({
      msg: 'Error Occurred While Deleting User',
      err: err,
      success: false
    })
  }
})
router.get('/getAllUsers', (req, res) => {
  try {
    User.find({}).then((users) => {
      res.send(users)
    })
  } catch (err) {
    res.send(err)
  }
})
router.get('/profile', passport.authenticate('jwt', {
  session: false
}),
(req, res) => {
  res.json({
    user: req.user
  })
})

module.exports = router
