const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin

// GET /signout 
router.get('/', checkLogin, function (req, res, next) {
  // clear session user info
  req.session.user = null
  req.flash('success', 'LogOutSuccess')
  // redirect to main page after logout
  res.redirect('/posts')
})

module.exports = router