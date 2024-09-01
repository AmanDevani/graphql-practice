const userTypeDefs = `#graphql
directive @isAuthenticated on FIELD_DEFINITION

  type User {
    _id: ID
    firstName: String
    lastName: String
    email: String
    gender: genderOptions
    password: String
    role: RoleOptions
    isDeleted: Boolean
    createdBy: ID
    updatedBy: ID
  }
  type RoleOptions {
    _id: ID
    role: String
  }
  enum genderOptions {
    male
    female
  }

  input UserInput {
    firstName: String!
    lastName: String
    email: String!
    gender: genderOptions
    password: String
  }

  input loginInput {
    email: String!
    password: String!
  }

  type loginResult {
    message: String,
    token: String
  }

  type CommonMessageResponse {
  message: String,
  user: User

}
type getUsersResponse {
  user: [User],
  count: Int
}
input UserWhereInput {
  id: ID!
}
enum UserListSortField {
  createdAt
}
input UserFilter {
  skip: Int
  limit: Int,
  searchTerm: String,
  isDeleted: Boolean
}
enum SortOrder {
  ASC
  DESC
}
input UserListSort {
  field: UserListSortField!
  order: SortOrder
}
  type Query {
    getUser(where: UserWhereInput!):User @isAuthenticated
    getUsers(filter: UserFilter, sort: UserListSort): getUsersResponse @isAuthenticated
  }
  type Mutation {
    loginUser(input: loginInput): loginResult
    register(input:UserInput) : CommonMessageResponse
  }
`;

export default userTypeDefs;
