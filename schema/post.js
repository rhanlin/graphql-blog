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
  deletePost(postId: ID!): [Post]
}
`

const isAuthenticated = resolverFunc => 
  (parent, args, context) => {
    if (!context.me) throw new ForbiddenError('Not logged in.')
    return resolverFunc.apply(null, [parent, args, context])
  }


const isPostAuthor = resolverFunc => 
  async (parent, args, context) => {
    const { postId } = args
    const { me, POST_MODEL } = context
    // console.log(parent, args, context)
    try {
      const { authorId } = await POST_MODEL.findPostByPostId(postId)
      if (authorId !== me.id) throw new ForbiddenError('Only Author Can Delete this Post')
      return resolverFunc.apply(null, [parent, args, context])
    } catch (error) {
      return error
    }   
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
    addPost: isAuthenticated( async (parent, { input }, { me, POST_MODEL }) => {

      const { title, body } = input

      const newPostResponse = await POST_MODEL.addPost({ authorId: me.id, title, body })
      // console.log(newPostResponse)
      const newPost = await POST_MODEL.findPostByPostId(newPostResponse.lastId)
      // console.log(newPost)
      
      return newPost
      
    }),
    likePost: isAuthenticated(async (parent, { postId }, { me, POST_MODEL }) => {

      let post = await POST_MODEL.findPostByPostId(postId)

      post.likeGiverIds = [post.likeGiverIds]
      // console.log('schema: '+ post.likeGiverIds)

      if (!post) throw new Error(`Post ${postId} Not Exists`)
      //TODO: 
      let updatePostInfo = {}
      if (!post.likeGiverIds.includes(postId)) {
        console.log('1: '+ post.likeGiverIds)

        updatePostInfo = await POST_MODEL.updatePost(postId, {
          likeGiverIds: post.likeGiverIds.concat(me.id)
        })
      } else {
        console.log('2: '+ post.likeGiverIds)
        
        updatePostInfo = await POST_MODEL.updatePost(postId, {
          likeGiverIds: post.likeGiverIds.filter(id => id === me.id)
        })
      }
      

      // console.log(':>>>>> '+ updatePostInfo)

      const updatedPost = await POST_MODEL.findPostByPostId(postId)
      // console.log('::::>>>>>>> '+ updatedPost)
      return updatedPost
    }),

    deletePost: isAuthenticated(
      isPostAuthor( 
        async (root, { postId }, { me, POST_MODEL }) => {
          try {
            // return await POST_MODEL.deletePost(postId)
            const {status} = await POST_MODEL.deletePost(postId)
            if(status !== '200') throw new Error(`status: ${status}, delete post fail`)
            const data = await POST_MODEL.filterPostsByUserId(me.id)
            console.log(data)
            return data
          } catch (error) {
            return error
          }
        }      
      )
    ),
  }
}

module.exports = {
  typeDefs,
  resolvers
}