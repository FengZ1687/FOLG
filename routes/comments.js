const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const CommentModel = require('../models/comments')

// POST /comments create a comment
router.post('/', checkLogin, function (req, res, next) {
  const author = req.session.user._id
  const postId = req.fields.postId
  const content = req.fields.content

  // check if comment is valid
  try {
    if (!content.length) {
      throw new Error('please enter comments')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  const comment = {
    author: author,
    postId: postId,
    content: content
  }

  CommentModel.create(comment)
    .then(function () {
      req.flash('success', 'comment successful')
      // back to previous page after comment successful
      res.redirect('back')
    })
    .catch(next)
})

// GET /comments/:commentId/remove delete a comment
router.get('/:commentId/remove', checkLogin, function (req, res, next) {
  const commentId = req.params.commentId
  const author = req.session.user._id

  CommentModel.getCommentById(commentId)
    .then(function (comment) {
      if (!comment) {
        throw new Error('comments not exist')
      }
      if (comment.author.toString() !== author.toString()) {
        throw new Error('no authentication for delete')
      }
      CommentModel.delCommentById(commentId)
        .then(function () {
          req.flash('success', 'delete comments successfull')
          // back to previous page after delete comment successful
          res.redirect('back')
        })
        .catch(next)
    })
})

module.exports = router