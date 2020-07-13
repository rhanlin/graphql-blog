const { gql } = require('apollo-server')
const USER_SCHEMA = require('./user')
const POST_SCHEMA = require('./post')
/*
 * 1. Schema
 */ 
const typeDefs = gql `
type Query {
  "測試用 Hello World"
  hello: String
}
type Mutation {
  test: Boolean
}
`
/*
 * 2. Resolver
 */ 
const resolvers = {
  Query: {
    hello: () => "world",
  },
  Mutation: {
    test: () => true,
  }
}

module.exports = {
  typeDefs: [typeDefs, USER_SCHEMA.typeDefs, POST_SCHEMA.typeDefs ],
  resolvers: [resolvers, USER_SCHEMA.resolvers, POST_SCHEMA.resolvers],
}