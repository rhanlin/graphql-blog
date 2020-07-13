const { gql, ForbiddenError, AuthenticationError } = require('apollo-server')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const typeDefs = gql`
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

extend type Query {
  "取得目前使用者"
  me: User
  "取得所有使用者"
  users: [User]
  "依照名字取得特定使用者"
  user(name: String!): User
}

input UpdateMyInfoInput {
    name: String
    age: Int
}

type Token {
  token: String!
}

extend type Mutation {
  updateMyInfo(input: UpdateMyInfoInput!): User
  addFriend(userId: ID!): User
  "註冊。 email 與 passwrod 必填"
  signUp(name: String, email: String!, password: String!): User
  "登入"
  login(email: String!, password: String!): Token
}
`

//helper functions
// Authentication (認證)
const hash = (text, saltRounds) => bcrypt.hash(text, saltRounds)

// login
const createToken = ({ id, email, name }, secret) => jwt.sign({ id, email, name }, secret, {
    expiresIn: '1d'
})

const isAuthenticated = resolverFunc => {
  return (parent, args, context) => {
    if (!context.me) throw new ForbiddenError('Not logged in.')
    return resolverFunc.apply(null, [parent, args, context])
  }
}

// Resolvers

const resolvers = {
  Query: {
    me: isAuthenticated((parent, args, { me, USER_MODEL }) => USER_MODEL.findUserByUserId(me.id)),
    users: (root, agrs, { USER_MODEL }) => USER_MODEL.getAllUsers(),
    user: (root, { name }, { USER_MODEL }) => USER_MODEL.findUserByName(name),
  },
  User: {
    posts: (parent, args, { POST_MODEL }) => POST_MODEL.filterPostsByUserId(parent.id),
    friends: (parent, args, { USER_MODEL }) => USER_MODEL.filterUsersByUserIds(parent.friendIds || [])
  },
  Mutation: {
    updateMyInfo: isAuthenticated((parent, { input }, { me, USER_MODEL }) => {
      // 過濾空值
      const data = ["name", "age"].reduce(
        (obj, key) => (input[key] ? { ...obj, [key]: input[key] } : obj),
        {}
      )
      console.log(data)
      console.log(me.id) //4
      
      return USER_MODEL.updateUserInfo(me.id, data)
    }),
    addFriend: isAuthenticated((parent, { userId }, { me: { id: meId }, USER_MODEL }) => {
      
      const me = USER_MODEL.findUserByUserId(meId)
      if (me.friendIds.include(userId)){
        throw new Error(`User ${userId} Already Friend.`)
      }
      const friend = USER_MODEL.findUserByUserId(userId)
      const newMe = USER_MODEL.updateUserInfo(meId, {
        friendIds: me.friendIds.concat(userId)
      })
      USER_MODEL.updateUserInfo(userId, { friendIds: friend.friendIds.concat(meId) })

      return newMe
    }),
    signUp: async (root, { name, email, password }, { saltRounds, USER_MODEL }) => {
      // 1. 檢查不能有重複註冊 email
      const isUserEmailDuplicate = USER_MODEL.getAllUsers().some(user => user.email === email)
      if (isUserEmailDuplicate) throw new Error('User Email Duplicate')

      // 2. 將 passwrod 加密再存進去。非常重要 !!
      const hashedPassword = await hash(password, saltRounds)
      // console.log(hashedPassword)
      
      // 3. 建立新 user
      return USER_MODEL.addUser({ 
        name, 
        email, 
        password: hashedPassword, 
        friendIds: [] 
      })
    },
    login: async (root, { email, password }, { secret, USER_MODEL }) => {
      // 1. 透過 email 找到相對應的 user
      const user = USER_MODEL.getAllUsers().find(user => user.email === email)
      if (!user) throw new Error('Email Account Not Exists')

      // 2. 將傳進來的 password 與資料庫存的 user.password 做比對
      const passwordIsValid = await bcrypt.compare(password, user.password)
      if (!passwordIsValid) throw new AuthenticationError('Wrong Password')

      // 3. 成功則回傳 token
      return { token: await createToken(user, secret) }
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}