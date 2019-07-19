const marked = require('marked')
const Post = require('../lib/mongo').Post
const CommentModel = require('./comments')

// all post  commentsCount
Post.plugin('addCommentsCount', {
  afterFind: function (posts) {
    return Promise.all(posts.map(function (post) {
      return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
        post.commentsCount = commentsCount
        return post
      })
    }))
  },
  afterFindOne: function (post) {
    if (post) {
      return CommentModel.getCommentsCount(post._id).then(function (count) {
        post.commentsCount = count
        return post
      })
    }
    return post
  }
})

//  transfer post  content from markdown to html
Post.plugin('contentToHtml', {
  afterFind: function (posts) {
    return posts.map(function (post) {
      post.content = marked(post.content)
      return post
    })
  },
  afterFindOne: function (post) {
    if (post) {
      post.content = marked(post.content)
    }
    return post
  }
})

module.exports = {
  // create a post
  create: function create (post) {
    return Post.create(post).exec()
  },

  // get a post based on post ID
  getPostById: function getPostById (postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },

  // query all posts based on time order, or get all posts from a specific user
  getPosts: function getPosts (author) {
    const query = {}
    if (author) {
      query.author = author
    }
    return Post
      .find(query)
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },

  // increase pv based on postID
  incPv: function incPv (postId) {
    return Post
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec()
  },

  // read post details include comments based on postID
  getRawPostById: function getRawPostById (postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .exec()
  },

  // update a post based on post ID
  updatePostById: function updatePostById (postId, data) {
    return Post.update({ _id: postId }, { $set: data }).exec()
  },

  // delete a psot based on post id
  delPostById: function delPostById (postId) {
    return Post.deleteOne({ _id: postId })
      .exec()
      .then(function (res) {
        // after delete the post, also delete all comments  after it
        if (res.result.ok && res.result.n > 0) {
          return CommentModel.delCommentsByPostId(postId)
        }
      })
  }
}