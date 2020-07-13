const POSTS = [
  {
    id: 1,
    authorId: 1,
    title: 'Hello World',
    body: 'This is my first post',
    likeGiverIds: [1, 2],
    createdAt: '2018-10-22T01:40:14.941Z'
  },
  {
    id: 2,
    authorId: 2,
    title: 'Nice Day',
    body: 'Hello My Friend!',
    likeGiverIds: [1],
    createdAt: '2018-10-24T01:40:14.941Z'
  }
]

// helper functions
const getAllPosts = () => POSTS

const filterPostsByUserId = userId => POSTS.filter(post => userId === post.authorId)
/*
 * 因為在 GraphQL 中我們使用 ID Scalar Type 的話他會預設轉為 String
 * 與我們在資料中存的 id 是 Integer 不相同，因此需要特別做 Number() 轉換。
 */
const findPostByPostId = postId => POSTS.find(post => post.id === Number(postId))

const addPost = ({ authorId, title, body }) =>
  (POSTS[POSTS.length] = {
    id: POSTS[POSTS.length - 1].id + 1,
    authorId,
    title,
    body,
    likeGiverIds: [],
    createdAt: new Date().toISOString()
  })

const updatePost = (postId, data) => Object.assign(findPostByPostId(postId), data)

//delete post
const deletePost = (postId) =>
  posts.splice(posts.findIndex(post => post.id === postId), 1)[0]

module.exports = {
  getAllPosts: getAllPosts,
  filterPostsByUserId: filterPostsByUserId,
  findPostByPostId: findPostByPostId,
  addPost: addPost,
  updatePost: updatePost,
  deletePost: deletePost,
}