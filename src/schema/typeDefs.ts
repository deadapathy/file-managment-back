export const typeDefs = `#graphql
  scalar Upload
  
  type User {
    id: ID!
    username: String!
    token: String
  }
  
  type CreateFolderResponse  {
    success: Boolean!
    message: String
  }

  input MultiUploadInput {
    files: [Upload!]!
  }

  type Files {
    _id: ID!
    name: String!
    size: String!
    type: String!
    url: String!
    uploadedAt: String
    folderId: ID
  }

  type Folders {
    _id: ID!
    name: String!
    size: String!
    url: String!
    uploadedAt: String
  }

  input FolderInput {
    id: ID!
    url: String!
  }

  type Query {
    files(folderId: ID): [Files!]!
    folders: [Folders!]!
  }

  type Mutation {
    register(username: String!, password: String!): User
    login(username: String!, password: String!): User
    createFolder(folderName: String!, uploadedAt: String, size: String, url: String): CreateFolderResponse!
    multiUpload(input: MultiUploadInput!, folderId: ID): String!
    deleteFile(fileUrl: String!, fileId: ID!): String!
    deleteFolder(folderUrl: String!, folderId: ID!): String!
    deleteManyItems(fileIds: [ID!]!, folderIdsWithUrls: [FolderInput!]!): String!
  }
`
