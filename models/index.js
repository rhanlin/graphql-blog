const { ForbiddenError } = require('apollo-server')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const USERS = [
  {
    id: 1,
    email: 'fong@test.com',
    password: '$2b$04$wcwaquqi5ea1Ho0aKwkZ0e51/RUkg6SGxaumo8fxzILDmcrv4OBIO', // 123456
    name: 'Fong',
    age: 23,
    friendIds: [2, 3]
  },
  {
    id: 2,
    email: 'kevin@test.com',
    passwrod: '$2b$04$uy73IdY9HVZrIENuLwZ3k./0azDvlChLyY1ht/73N4YfEZntgChbe', // 123456
    name: 'Kevin',
    age: 40,
    friendIds: [1]
  },
  {
    id: 3,
    email: 'mary@test.com',
    password: '$2b$04$UmERaT7uP4hRqmlheiRHbOwGEhskNw05GHYucU73JRf8LgWaqWpTy', // 123456
    name: 'Mary',
    age: 18,
    friendIds: [1]
  }
]

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
const getAllUsers = () => USERS

const getAllPosts = () => POSTS

const filterPostsByUserId = userId => POSTS.filter(post => userId === post.authorId)

const filterUsersByUserIds = userIds => USERS.filter(user => userIds.includes(user.id))
  
const findUserByUserId = userId => USERS.find(user => user.id === Number(userId))
/*
 * 因為在 GraphQL 中我們使用 ID Scalar Type 的話他會預設轉為 String
 * 與我們在資料中存的 id 是 Integer 不相同，因此需要特別做 Number() 轉換。
 */
const findUserByName = name => USERS.find(user => user.name === name)

const findPostByPostId = postId => POSTS.find(post => post.id === Number(postId))

const updateUserInfo = (userId, data) => Object.assign(findUserByUserId(userId), data)

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

// Authentication (認證)
// const hash = text => bcrypt.hash(text, SALT_ROUNDS)
const hash = (text, saltRounds) => bcrypt.hash(text, saltRounds)

const addUser = ({ name, email, password, friendIds }) => (
  USERS[USERS.length] = {
    id: USERS[USERS.length - 1].id + 1,
    name,
    email,
    password,
    friendIds
  }
)
// login

const createToken = ({ id, email, name }, secret) => jwt.sign({ id, email, name }, secret, {
    expiresIn: '1d'
})
// const createToken = ({ id, email, name }) => jwt.sign({ id, email, name }, SECRET, {
//   expiresIn: '1d'
// })

const isAuthenticated = resolverFunc => {
  return (parent, args, context) => {
    if (!context.me) throw new ForbiddenError('Not logged in.')
    return resolverFunc.apply(null, [parent, args, context])
  }
}
// const isAuthenticated = resolverFunc => (parent, args, context) => {
//   if (!context.me) throw new ForbiddenError('Not logged in.')
//   return resolverFunc.apply(null, [parent, args, context])
// }


//delete post
const deletePost = (postId) =>
  posts.splice(posts.findIndex(post => post.id === postId), 1)[0]


const isPostAuthor = resolverFunc => (parent, args, context) => {
  const { postId } = args
  const { me } = context
  const isAuthor = findPostByPostId(postId).authorId === me.id
  if (!isAuthor) throw new ForbiddenError('Only Author Can Delete this Post')
  return resolverFunc.applyFunc(parent, args, context)
}

module.exports = {
  getAllUsers: getAllUsers,
  getAllPosts: getAllPosts,
  filterPostsByUserId: filterPostsByUserId,
  filterUsersByUserIds: filterUsersByUserIds,
  findUserByUserId: findUserByUserId,
  findUserByName: findUserByName,
  findPostByPostId: findPostByPostId,
  updateUserInfo: updateUserInfo,
  addPost: addPost,
  updatePost: updatePost,
  hash: hash,
  addUser: addUser,
  createToken: createToken,
  isAuthenticated: isAuthenticated,
  deletePost: deletePost,
  isPostAuthor: isPostAuthor,
}