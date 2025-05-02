import mongoose, { Document, Schema } from "mongoose";

export interface FolderDocument extends Document {
  folderName: string;
}

const folderSchema = new Schema<FolderDocument>({
  folderName: { type: String, required: true, unique: true },
});

export const Folder = mongoose.model<FolderDocument>("folders", folderSchema);
