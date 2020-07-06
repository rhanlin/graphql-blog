const { ApolloServer, gql } = require('apollo-server')
const ME_ID = 1
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
// const ME_ID = require('./mockdata')
// const USERS = require('./mockdata')
// const POSTS = require('./mockdata')
// import { ME_ID, USERS, POSTS } from 'mockdata'

// helper functions
const filterPostsByUserId = userId => POSTS.filter(post => userId === post.authorId)

const filterUsersByUserIds = userIds => USERS.filter(user => userIds.includes(user.id))
  
const findUserByUserId = userId => USERS.find(user => user.id === Number(userId))

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

const updatePost = (postId, data) =>
  Object.assign(findPostByPostId(postId), data)

// Schema
const typeDefs = gql `
  """
  使用者
  """
  type User {
    "識別碼"
    id: ID!
    "帳號 email"
    email: String!
    "名字"
    name: String
    "年齡"
    age: Int
    "朋友"
    friends: [User]
    "貼文"
    posts: [Post]
  }

  """
  貼文
  """
  type Post {
    "識別碼"
    id: ID!
    "作者"
    author: User
    "標題"
    title: String
    "內容"
    body: String
    "按讚者"
    likeGivers: [User]
    "建立時間 (ISO 格式)"
    createdAt: String
  }

  type Query {
    "測試用 Hello World"
    hello: String
    "取得目前使用者"
    me: User
    "取得所有使用者"
    users: [User]
    "依照名字取得特定使用者"
    user(name: String!): User
    "取得所有貼文"
    posts: [Post]
    "依照 id 取得特定貼文"
    post(id: ID!): Post
  }

  input UpdateMyInfoInput {
    name: String
    age: Int
  }

  input AddPostInput {
    title: String!
    body: String
  }

  type Mutation {
    updateMyInfo(input: UpdateMyInfoInput!): User
    addFriend(userId: ID!): User
    addPost(input: AddPostInput!): Post
    likePost(postId: ID!): Post
  }
`

const resolvers = {
  Query: {
    hello: () => "world",
    me: () => findUserByUserId(ME_ID),
    users: () => USERS,
    user: (root, { name }, context) => findUserByName(name),
    posts: () => POSTS,
    post: (root, { id }, context) => findPostByPostId(id)
  },
  User: {
    posts: (parent, args, context) => filterPostsByUserId(parent.id),
    friends: (parent, args, context) => filterUsersByUserIds(parent.friendIds || [])
  },
  Post: {
    author: (parent, args, context) => findUserByUserId(parent.authorId),
    likeGivers: (parent, args, context) => filterUsersByUserIds(parent.likeGiverIds)
  },
  Mutation: {
    updateMyInfo: (parent, { input }, context) => {
      // 過濾空值
      const data = ["name", "age"].reduce(
        (obj, key) => (input[key] ? { ...obj, [key]: input[key] } : obj),
        {}
      )

      return updateUserInfo(ME_ID, data)
    },
    addFriend: (parent, { userId }, context) => {
      const me = findUserByUserId(ME_ID)
      if (me.friendIds.include(userId))
        throw new Error(`User ${userId} Already Friend.`)

      const friend = findUserByUserId(userId)
      const newMe = updateUserInfo(ME_ID, {
        friendIds: me.friendIds.concat(userId)
      })
      updateUserInfo(userId, { friendIds: friend.friendIds.concat(ME_ID) })

      return newMe
    },
    addPost: (parent, { input }, context) => {
      const { title, body } = input
      return addPost({ authorId: ME_ID, title, body })
    },
    likePost: (parent, { postId }, context) => {
      const post = findPostByPostId(postId)

      if (!post) throw new Error(`Post ${postId} Not Exists`)

      if (!post.likeGiverIds.includes(postId)) {
        return updatePost(postId, {
          likeGiverIds: post.likeGiverIds.concat(ME_ID)
        })
      }

      return updatePost(postId, {
        likeGiverIds: post.likeGiverIds.filter(id => id === ME_ID)
      })
    }
  }
}

// 3. 初始化 Web Server ，需傳入 typeDefs (Schema) 與 resolvers (Resolver)
const server = new ApolloServer({
  // Schema 部分
  typeDefs,
  // Resolver 部分
  resolvers
})

// 4. 啟動 Server
server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`)
})