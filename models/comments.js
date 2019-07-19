const marked = require('marked')
const Comment = require('../lib/mongo').Comment

// transfer comment content from markdown to html
Comment.plugin('contentToHtml', {
  afterFind: function (comments) {
    return comments.map(function (comment) {
      comment.content = marked(comment.content)
      return comment
    })
  }
})

module.exports = {
  // leave a comment
  create: function create (comment) {
    return Comment.create(comment).exec()
  },

  // get a comment based on comment ID
  getCommentById: function getCommentById (commentId) {
    return Comment.findOne({ _id: commentId }).exec()
  },

  // delete a comment based on comment ID
  delCommentById: function delCommentById (commentId) {
    return Comment.deleteOne({ _id: commentId }).exec()
  },

  // delete all commnets from a post based on post ID
  delCommentsByPostId: function delCommentsByPostId (postId) {
    return Comment.deleteMany({ postId: postId }).exec()
  },

  // get comments based on blog post ID，sort them based on time 
  getComments: function getComments (postId) {
    return Comment
      .find({ postId: postId })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .contentToHtml()
      .exec()
  },

  // get comments numbers based on blog post ID
  getCommentsCount: function getCommentsCount (postId) {
    return Comment.count({ postId: postId }).exec()
  }
}