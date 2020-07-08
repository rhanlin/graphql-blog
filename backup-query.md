# mutation{
  #   deletePost(postId: 2) {
  #     id
  #     title
  #     body
  #   }
  # }
  
  # query {
  #   me{
  #     id
  #     name
  #   }
  # }
  
  mutation ($updateMeInput: UpdateMyInfoInput!, $addPostInput:AddPostInput!) {
    updateMyInfo(input: $updateMeInput) {
      id
      name
      age
    }
    addPost(input: $addPostInput) {
      id
      title
      body
      author {
        name
      }
      createdAt
    }
    likePost(postId: 1) {
      id
    }
  }
  
  # mutation {
  #   login(email: "fong@test.com", password: "123456"){
  #     token
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