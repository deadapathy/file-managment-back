export const typeDefs = `#graphql
  scalar Upload
  
  type User {
    id: ID!
    username: String!
    token: String
  }

  type Query {
    listFolders: [FolderInfo!]!
  }
  
  type CreateFolderResponse  {
    success: Boolean!
    message: String
  }

  type FolderInfo {
    name: String!
  }

  input MultiUploadInput {
    files: [Upload!]!
  }

  type Mutation {
    register(username: String!, password: String!): User
    login(username: String!, password: String!): User
    createFolder(folderName: String!): CreateFolderResponse!
    multiUpload(input: MultiUploadInput!): String!
  }
`;
