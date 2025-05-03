import mongoose, { Document, Schema } from 'mongoose'

export interface FoldersDocument extends Document {
	name: string
	size: string
	uploadedAt: Date
	url: string
}

const folderSchema = new Schema<FoldersDocument>({
	name: { type: String, required: true, unique: true },
	size: { type: String, required: false },
	uploadedAt: { type: Date, required: false, default: Date.now },
	url: { type: String, required: false },
})

export const Folders = mongoose.model<FoldersDocument>('folders', folderSchema)
