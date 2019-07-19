const User = require('../lib/mongo').User

module.exports = {
  // user registration create user info database
  create: function create (user) {
    return User.create(user).exec()
  },

  // get user info based on user ID
  getUserByName: function getUserByName (name) {
    return User
      .findOne({ name: name })
      .addCreatedAt()
      .exec()
  }
}
