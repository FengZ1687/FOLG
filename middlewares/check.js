module.exports = {
    checkLogin: function checkLogin (req, res, next) {
      if (!req.session.user) {
        req.flash('error', 'unlogin' )
        return res.redirect('/signin')
      }
      next()
    },
  
    checkNotLogin: function checkNotLogin (req, res, next) {
      if (req.session.user) {
        req.flash('error', 'already logged in ')
        return res.redirect('back')// back to previous page
      }
      next()
    }
  }