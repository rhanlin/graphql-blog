require('dotenv').config()

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS)
const SECRET = process.env.SECRET
// console.log(SALT_ROUNDS, SECRET)

const { ApolloServer, gql, ForbiddenError } = require('apollo-server')
const { USERS, POSTS } = require('./mockdata')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {
  getAllUsers,
  getAllPosts,
  filterPostsByUserId,
  filterUsersByUserIds,
  findUserByUserId,
  findUserByName,
  findPostByPostId,
  updateUserInfo,
  addPost,
  updatePost,
  hash,
  addUser,
  createToken,
  isAuthenticated,
  deletePost,
  isPostAuthor,
} = require('./models');

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

  type Token {
    token: String!
  }

  type Mutation {
    updateMyInfo(input: UpdateMyInfoInput!): User
    addFriend(userId: ID!): User
    addPost(input: AddPostInput!): Post
    likePost(postId: ID!): Post
    deletePost(postId: ID!): Post
    "註冊。 email 與 passwrod 必填"
    signUp(name: String, email: String!, password: String!): User
    "登入"
    login(email: String!, password: String!): Token
  }
`

const resolvers = {
  Query: {
    hello: () => "world",
    // me: (root, args, { me }) => {
    //   if (!me) throw new Error ('Plz Log In First')
    //   return findUserByUserId(me.id)
    // },
    me: isAuthenticated((parent, args, { me }) => findUserByUserId(me.id)),
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
    updateMyInfo: isAuthenticated((parent, { input }, { me }) => {
      
      // 過濾空值
      const data = ["name", "age"].reduce(
        (obj, key) => (input[key] ? { ...obj, [key]: input[key] } : obj),
        {}
      )
      console.log(data)
      console.log(me.id) //4
      
      return updateUserInfo(me.id, data)
    }),
    addFriend: isAuthenticated((parent, { userId }, { me: { id: meId } }) => {
      
      const me = findUserByUserId(meId)
      if (me.friendIds.include(userId)){
        throw new Error(`User ${userId} Already Friend.`)
      }
      const friend = findUserByUserId(userId)
      const newMe = updateUserInfo(meId, {
        friendIds: me.friendIds.concat(userId)
      })
      updateUserInfo(userId, { friendIds: friend.friendIds.concat(meId) })

      return newMe
    }),
    addPost: isAuthenticated((parent, { input }, { me }) => {

      const { title, body } = input

      return addPost({ authorId: me.id, title, body })
    }),
    likePost: isAuthenticated((parent, { postId }, { me }) => {

      const post = findPostByPostId(postId)

      if (!post) throw new Error(`Post ${postId} Not Exists`)

      if (!post.likeGiverIds.includes(postId)) {
        return updatePost(postId, {
          likeGiverIds: post.likeGiverIds.concat(me.id)
        })
      }

      return updatePost(postId, {
        likeGiverIds: post.likeGiverIds.filter(id => id === me.id)
      })
    }),
    deletePost: isAuthenticated(isPostAuthor((root, { postId }, { me }) => {
      return deletePost(postId)
    })),
    signUp: async (root, { name, email, password }, { saltRounds }) => {
      // 1. 檢查不能有重複註冊 email
      const isUserEmailDuplicate = USERS.some(user => user.email === email)
      if (isUserEmailDuplicate) throw new Error('User Email Duplicate')

      // 2. 將 passwrod 加密再存進去。非常重要 !!
      const hashedPassword = await hash(password, saltRounds)
      // console.log(hashedPassword)
      
      // 3. 建立新 user
      return addUser({ 
        name, 
        email, 
        password: hashedPassword, 
        friendIds: [] 
      })
    },
    login: async (root, { email, password }, { secret }) => {
      // 1. 透過 email 找到相對應的 user
      const user = USERS.find(user => user.email === email)
      if (!user) throw new Error('Email Account Not Exists')

      // 2. 將傳進來的 password 與資料庫存的 user.password 做比對
      const passwordIsValid = await bcrypt.compare(password, user.password)
      if (!passwordIsValid) throw new Error('Wrong Password')

      // 3. 成功則回傳 token
      return { token: await createToken(user, secret) }
    }
  }
}

// 3. 初始化 Web Server ，需傳入 typeDefs (Schema) 與 resolvers (Resolver)
const server = new ApolloServer({
  // Schema 部分
  typeDefs,
  // Resolver 部分
  resolvers,
  // context 部分
  context: async ({ req }) => {
    const context = { secret: SECRET, saltRounds: SALT_ROUNDS }
    // 1. 取出
    const token = req.headers['x-token']
    if (token) {
      try {
        // 2. 檢查 token + 取得解析出的資料
        const me = await jwt.verify(token, SECRET)
        // 3. 放進 context
        return { ...context ,me }
      } catch (e) {
        throw new Error('Your session expired. Sign in again.')
      }
    }
    // 如果沒有 token 就回傳空的 context 出去
    return context
  }
})

// 4. 啟動 Server
server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`)
})