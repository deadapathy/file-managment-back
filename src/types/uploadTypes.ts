export interface UploadFile {
	filename: string
	mimetype: string
	encoding: string
	createReadStream: () => NodeJS.ReadableStream
}

export type MultiUploadType = {
	input: { files: UploadFile[] }
	folderId: string
}

export type DeleteFileType = { fileUrl: string; fileId: string }
export type DeleteFolderType = { folderUrl: string; folderId: string }
