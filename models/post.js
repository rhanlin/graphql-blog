const db = require('../database.js')

// helper functions
const getAllPosts = () => {
  const sql = `SELECT * FROM posts`
  const param = []
  return new Promise((resolve, reject)=> {
    db.all(sql, param, (err, rows) => {
      if (err) {
        // console.log(err)
        reject(err)
      } else {
        // console.log(rows)
        resolve(rows)
      }
    })
  })
}

// const filterPostsByUserId = userId => POSTS.filter(post => userId === post.authorId)
const filterPostsByUserId = userId => {
  const param = userId
  // console.log(':>>>>'+ param)
  
  if (!param) {
    throw new Error('Need author Id.')
  }
  
  const sql = `SELECT * FROM posts WHERE authorId = ?`
  return new Promise((resolve, reject) => {
    db.all(sql, param, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}
/*
 * 因為在 GraphQL 中我們使用 ID Scalar Type 的話他會預設轉為 String
 * 與我們在資料中存的 id 是 Integer 不相同，因此需要特別做 Number() 轉換。
 */
// const findPostByPostId = postId => POSTS.find(post => post.id === Number(postId))
const findPostByPostId = postId => {
  const param = postId
  // console.log(':>>>>'+ param)
  
  if (!param) {
    throw new Error('Need author Id.')
  }
  
  const sql = `SELECT * FROM posts WHERE id = ?`
  return new Promise((resolve, reject) => {
    db.get(sql, param, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        // console.log(rows)
        resolve(rows)
      }
    })
  })
}

// const addPost = ({ authorId, title, body }) =>
//   (POSTS[POSTS.length] = {
//     id: POSTS[POSTS.length - 1].id + 1,
//     authorId,
//     title,
//     body,
//     likeGiverIds: [],
//     createdAt: new Date().toISOString()
//   })
const addPost = ({ authorId, title, body }) => {
  const createdTime = new Date()
  const likeGiverIds = []
  const params = [
    authorId,
    title,
    body
  ]
  console.log(params)
  
  const sql = `INSERT INTO posts(
    authorId,
    title,
    body,
    likeGiverIds,
    createdAt
  ) VALUES (?,?,?,"${likeGiverIds}","${createdTime}")`
  console.log(sql)
  
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err){
      if (err) {
        reject(err)
      } else {
        resolve(
          {
            lastId: this.lastID,
            status: "200",
            message: "success"
          }
        )
      }
    })
  })
}

// const updatePost = (postId, data) => Object.assign(findPostByPostId(postId), data)
const updatePost = async (postId, data) => {
  const updatedPostInfo = Object.assign(await findPostByPostId(postId), data)
  // console.log('assign:>>>>'+Object.keys(updatedPostInfo))
  const likeGiverIds = updatedPostInfo.likeGiverIds
  // console.log('likeGiverIds:>>>>'+likeGiverIds)
  
  const param = [postId]
  const sql = `UPDATE posts SET likeGiverIds = "${likeGiverIds}" WHERE id = ?`
  // console.log(sql)
  return new Promise((resolve, reject) => {
    db.run(sql, param, function(err){
      if (err) {
        reject(err)
      } else {
        // console.log('this '+this)
        // console.log('lastID '+this.lastID)
        // console.log('changes '+this.changes)
        resolve(
          {
            status: "200",
            message: "success"
          }
        )
      }
    })
  })
  
  
}

//delete post
// const deletePost = (postId) => posts.splice(posts.findIndex(post => post.id === postId), 1)[0]
const deletePost = async (postId) => {
  const param = postId
  const sql = `DELETE FROM posts WHERE id = ?`
  console.log(sql)
  
  return new Promise((resolve, reject) => {
    db.run(sql, param, function(err){
      if (err) {
        reject(err)
      } else {
        // console.log('this '+this)
        console.log('lastID '+this.lastID)
        console.log('changes '+this.changes)
        resolve(
          {
            status: "200",
            message: "success"
          }
        )
      }
    })
  })
}

module.exports = {
  getAllPosts: getAllPosts,
  filterPostsByUserId: filterPostsByUserId,
  findPostByPostId: findPostByPostId,
  addPost: addPost,
  updatePost: updatePost,
  deletePost: deletePost,
}