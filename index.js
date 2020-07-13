require('dotenv').config()
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS)
const SECRET = process.env.SECRET

const jwt = require('jsonwebtoken')
const { ApolloServer } = require('apollo-server')
const { typeDefs, resolvers } = require('./schema')
const { USER_MODEL, POST_MODEL } = require('./models')

/*
 * 3. 初始化 Web Server ，需傳入 typeDefs (Schema) 與 resolvers (Resolver)
 */ 
const server = new ApolloServer({
  // Schema 部分
  typeDefs,
  // Resolver 部分
  resolvers,
  // context 部分
  context: async ({ req }) => {
    const context = { 
      secret: SECRET,
      saltRounds: SALT_ROUNDS,
      USER_MODEL,
      POST_MODEL,
    }
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

/*
 * 4. 啟動 Server
 */
server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`)
})