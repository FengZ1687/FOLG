const path = require('path')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')
const winston = require('winston')
const expressWinston = require('express-winston')

const app = express()

// get model dir path
app.set('views', path.join(__dirname, 'views'))
// set model engine to ejs type
app.set('view engine', 'ejs')

// set static file dir
app.use(express.static(path.join(__dirname, 'public')))
// session 
app.use(session({
  name: config.session.key, // save session Id in cookie
  secret: config.session.secret, // set secret to calculate hash value ,place it in cookie to prevent signedCookie to be changed
  resave: true, // update session
  saveUninitialized: false, // set false，force to createa  session，even the user has not login
  cookie: {
    maxAge: config.session.maxAge// aotu delete session id in cookie
  },
  store: new MongoStore({// store session in mongodb
    url: config.mongodb// mongodb address
  })
}))
// flash middleware，for display notification
app.use(flash())

// handle forms and middlewares
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'), // upload file dir
  keepExtensions: true// keep file extension name
}))

// global variable
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

// add three necessary varibales 
app.use(function (req, res, next) {
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

// success log
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}))
// routes
routes(app)
// failed log
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}))

app.use(function (err, req, res, next) {
  console.error(err)
  req.flash('error', err.message)
  res.redirect('/posts')
})

if (module.parent) {
  // if require，exports app
  module.exports = app
} else {
  // listen to port, start to execute
  app.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`)
  })
}