const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')

// GET /posts 
//   eg: GET /posts?author=xxx
router.get('/', function (req, res, next) {
  const author = req.query.author

  PostModel.getPosts(author)
    .then(function (posts) {
      res.render('posts', {
        posts: posts
      })
    })
    .catch(next)
})

// POST /posts/create make a post
router.post('/create', checkLogin, function (req, res, next) {
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content

  // check input 
  try {
    if (!title.length) {
      throw new Error('please enter title')
    }
    if (!content.length) {
      throw new Error('please enter content')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  let post = {
    author: author,
    title: title,
    content: content
  }

  PostModel.create(post)
    .then(function (result) {
      // insert  mongodb  _id
      post = result.ops[0]
      req.flash('success', 'post success')
      // redirect to main blog page after post success
      res.redirect(`/posts/${post._id}`)
    })
    .catch(next)
})

// GET /posts/create post page
router.get('/create', checkLogin, function (req, res, next) {
  res.render('create')
})

// GET /posts/:postId see post details with comments
router.get('/:postId', function (req, res, next) {
  const postId = req.params.postId

  Promise.all([
    PostModel.getPostById(postId), // get post blog ID
    CommentModel.getComments(postId), // get post blog comments
    PostModel.incPv(postId)// pv 加 1
  ])
    .then(function (result) {
      const post = result[0]
      const comments = result[1]
      if (!post) {
        throw new Error('blog no longer exist')
      }

      res.render('post', {
        post: post,
        comments: comments
      })
    })
    .catch(next)
})

// GET /posts/:postId/edit update blog page
router.get('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('this blog does not exist')
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('no authentication you are not the creator of this post')
      }
      res.render('edit', {
        post: post
      })
    })
    .catch(next)
})

// POST /posts/:postId/edit update post
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content

  // check input valid
  try {
    if (!title.length) {
      throw new Error('please enter title')
    }
    if (!content.length) {
      throw new Error('please enter conent')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('post does not exist')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('no authentication')
      }

      PostModel.updatePostById(postId, { title: title, content: content })
        .then(function () {
          req.flash('success', 'edit successful')
          // back to previous page
          res.redirect(`/posts/${postId}`)
        })
        .catch(next)
    })
})

// GET /posts/:postId/remove delete a post
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('post does not exist')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('No authentication')
      }
      PostModel.delPostById(postId)
        .then(function () {
          req.flash('success', 'delete successful')
          // back to main page
          res.redirect('/posts')
        })
        .catch(next)
    })
})

module.exports = router