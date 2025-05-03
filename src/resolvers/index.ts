import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import {
	DeleteFileType,
	DeleteFolderType,
	MultiUploadType,
} from '../types/uploadTypes.js'
import { UserType } from '../types/userTypes.js'
import { fileService } from '../services/fileService.js'
import { folderService } from '../services/folderService.js'
import { userService } from '../services/userService.js'

export const resolvers = {
	Upload: GraphQLUpload,

	Query: {
		async files(_: unknown, args: { folderId?: string }) {
			return await fileService.getAllFiles(args.folderId)
		},
		async folders() {
			return await folderService.getAllFolders()
		},
	},

	Mutation: {
		register: async (_: unknown, { username, password }: UserType) => {
			return await userService.register(username, password)
		},

		login: async (_: unknown, { username, password }: UserType) => {
			return await userService.login(username, password)
		},

		createFolder: async (
			_: unknown,
			{ folderName }: { folderName: string }
		) => {
			return await folderService.createFolder(folderName)
		},

		multiUpload: async (
			_: unknown,
			{ input: { files }, folderId }: MultiUploadType
		) => {
			return await fileService.uploadFiles(files, folderId)
		},

		deleteFile: async (_: unknown, { fileUrl, fileId }: DeleteFileType) => {
			return await fileService.deleteFile(fileUrl, fileId)
		},

		deleteFolder: async (
			_: unknown,
			{ folderUrl, folderId }: DeleteFolderType
		) => {
			return await folderService.deleteFolder(folderUrl, folderId)
		},
	},
}
