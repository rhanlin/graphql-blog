# query {
#   hello
# }

# mutation {
#   test
# }

# mutation{
#   signUp(name:"Spencer", email:"spencer@gmail.com", password: "123456"){
#     id
#     name
#     email
#     age
#     friends{
#       name
#     }
#     posts{
#       title
#     }
#   }
# }

# mutation {
#   login(email: "spencer@gmail.com", password: "123456"){
#     token
#   }
# }

  # mutation ($updateMeInput: UpdateMyInfoInput!, $addPostInput:AddPostInput!) {
  #   updateMyInfo(input: $updateMeInput) {
  #     id
  #     name
  #     age
  #   }
  #   addPost(input: $addPostInput) {
  #     id
  #     title
  #     body
  #     author {
  #       name
  #     }
  #     createdAt
  #   }
  #   likePost(postId: 1) {
  #     id
  #   }
  # }
  


  # query{
  #   posts{
  #     author {
  #       name
  #     }
  #     title
  #     body
  #   }
  # }
  
  # mutation{
  #   deletePost(postId: 2) {
  #     id
  #     title
  #     body
  #   }
  # }



### query variables
{
  "updateMeInput": {
    "name": "NewTestMan",
    "age": 28
  },
  "addPostInput": {
    "title": "Test ~ Hello World",
    "body": "testttttinggggg"
  }
}

### HTTP HEADERS
{
  "x-token": "ey..."
}