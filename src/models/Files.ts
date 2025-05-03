import mongoose, { Document, Schema } from 'mongoose'

export interface FilesDocument extends Document {
	name: string
	size: string
	type: string
	url: string
	uploadedAt: Date
	folderId: mongoose.Types.ObjectId | string
}

const filesSchema = new Schema<FilesDocument>({
	name: { type: String, required: true, unique: true },
	size: { type: String, required: false },
	type: { type: String, required: false },
	url: { type: String, required: false },
	uploadedAt: { type: Date, required: false, default: Date.now },
	folderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'folders',
		required: false,
	},
})

export const Files = mongoose.model<FilesDocument>('files', filesSchema)
