const sha1 = require('sha1')
const express = require('express')
const router = express.Router()

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

// GET /signin 登录页
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signin')
})

// POST /signin 用户登录
router.post('/', checkNotLogin, function (req, res, next) {
  const name = req.fields.name
  const password = req.fields.password

  // 校验参数
  try {
    if (!name.length) {
      throw new Error('Please Enter user ID')
    }
    if (!password.length) {
      throw new Error('Please Enter password')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  UserModel.getUserByName(name)
    .then(function (user) {
      if (!user) {
        req.flash('error', 'User does not exist')
        return res.redirect('back')
      }
      // check password matches
      if (sha1(password) !== user.password) {
        req.flash('error', 'user name or password incorrect')
        return res.redirect('back')
      }
      req.flash('success', 'Login success')
      // write suer info into session
      delete user.password
      req.session.user = user
      // redirect to main page
      res.redirect('/posts')
    })
    .catch(next)
})

module.exports = router