const { gql, ForbiddenError } = require('apollo-server')

const typeDefs = gql`
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

extend type Query {
  "取得所有貼文"
  posts: [Post]
  "依照 id 取得特定貼文"
  post(id: ID!): Post
}

input AddPostInput {
  title: String!
  body: String
}

extend type Mutation {
  addPost(input: AddPostInput!): Post
  likePost(postId: ID!): Post
  deletePost(postId: ID!): Post
}
`

const isAuthenticated = resolverFunc => {
  return (parent, args, context) => {
    if (!context.me) throw new ForbiddenError('Not logged in.')
    return resolverFunc.apply(null, [parent, args, context])
  }
}

const isPostAuthor = resolverFunc => (parent, args, context) => {
  const { postId } = args
  const { me, POST_MODEL } = context
  const isAuthor = POST_MODEL.findPostByPostId(postId).authorId === me.id
  if (!isAuthor) throw new ForbiddenError('Only Author Can Delete this Post')
  return resolverFunc.applyFunc(parent, args, context)
}

const resolvers = {
  Query: {
    posts: (root, agrs, { POST_MODEL }) => POST_MODEL.getAllPosts(),
    post: (root, { id }, { POST_MODEL }) => POST_MODEL.findPostByPostId(id)
  },
  Post: {
    author: (parent, args, { USER_MODEL }) => USER_MODEL.findUserByUserId(parent.authorId),
    likeGivers: (parent, args, { USER_MODEL }) => USER_MODEL.filterUsersByUserIds(parent.likeGiverIds)
  },
  Mutation: {
    addPost: isAuthenticated((parent, { input }, { me, POST_MODEL }) => {

      const { title, body } = input

      return POST_MODEL.addPost({ authorId: me.id, title, body })
    }),
    likePost: isAuthenticated((parent, { postId }, { me, POST_MODEL }) => {

      const post = POST_MODEL.findPostByPostId(postId)

      if (!post) throw new Error(`Post ${postId} Not Exists`)

      if (!post.likeGiverIds.includes(postId)) {
        return POST_MODEL.updatePost(postId, {
          likeGiverIds: post.likeGiverIds.concat(me.id)
        })
      }

      return POST_MODEL.updatePost(postId, {
        likeGiverIds: post.likeGiverIds.filter(id => id === me.id)
      })
    }),
    deletePost: isAuthenticated(isPostAuthor((root, { postId }, { me, POST_MODEL }) => {
      return POST_MODEL.deletePost(postId)
    })),
  }
}

module.exports = {
  typeDefs,
  resolvers
}