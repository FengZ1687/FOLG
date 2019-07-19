const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const express = require('express')
const router = express.Router()

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

// GET /signup page
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signup')
})

// POST /signup user regist
router.post('/', checkNotLogin, function (req, res, next) {
  const name = req.fields.name
  const gender = req.fields.gender
  const bio = req.fields.bio
  const avatar = req.files.avatar.path.split(path.sep).pop()
  let password = req.fields.password
  const repassword = req.fields.repassword

  // 
  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('please keep name length in 1-10 characters')
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('gender can only be  m、f or x')
    }
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('please keep profile content length in 1-30 characters')
    }
    if (!req.files.avatar.name) {
      throw new Error('avatar required!')
    }
    if (password.length < 6) {
      throw new Error('password must contain at least 6 characters')
    }
    if (password !== repassword) {
      throw new Error('passowrds does not match')
    }
  } catch (e) {
    // registration failed, delete all post information stored
    fs.unlink(req.files.avatar.path)
    req.flash('error', e.message)
    return res.redirect('/signup')
  }

  // hash password
  password = sha1(password)

  // user info waiting for wite into database
  let user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  }
  // create user in database
  UserModel.create(user)
    .then(function (result) {
      
      user = result.ops[0]
      // store user info to session
      delete user.password
      req.session.user = user
      // write flash
      req.flash('success', 'Sign up successful')
      
      res.redirect('/posts')
    })
    .catch(function (e) {
      // in case of registration failed
      fs.unlink(req.files.avatar.path)
      // user ID already exist
      if (e.message.match('duplicate key')) {
        req.flash('error', 'Sorry, the user name is already taken')
        return res.redirect('/signup')
      }
      next(e)
    })
})

module.exports = router