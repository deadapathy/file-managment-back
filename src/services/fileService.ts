import { Files } from '../models/Files.js'
import { Folders } from '../models/Folders.js'
import { s3 } from '../config/aws.js'
import { UploadFile } from '../types/uploadTypes.js'

export const fileService = {
	async getAllFiles(folderId: string) {
		const filter = folderId ? { folderId } : {}
		return await Files.find(filter).sort({ uploadedAt: -1 })
	},

	async uploadFiles(files: UploadFile[], folderId: string) {
		try {
			let folderName = ''

			if (folderId) {
				const folder = await Folders.findById(folderId)
				if (!folder) throw new Error('Folder not found')
				folderName = folder.name
			}

			const uploadPromises = files.map(async (uploadFile) => {
				const { createReadStream, filename, mimetype } = await uploadFile

				const stream = createReadStream()
				const buffer: Buffer = await new Promise((resolve, reject) => {
					const chunks: Buffer[] = []
					stream.on('data', (chunk) => chunks.push(chunk))
					stream.on('end', () => resolve(Buffer.concat(chunks)))
					stream.on('error', reject)
				})

				const filePath = folderName ? `${folderName}/${filename}` : filename

				const params = {
					Bucket: process.env.AWS_S3_BUCKET_NAME,
					Key: `${filePath}`,
					Body: buffer,
				}

				const res = await s3.upload(params).promise()
				await Files.create({
					name: filename,
					size: buffer.length,
					type: mimetype,
					url: res.Location,
					uploadedAt: new Date(),
					folderId: folderId,
				})

				return `Uploaded Location: ${res.Location}`
			})

			return await Promise.all(uploadPromises)
		} catch (error) {
			throw new Error('Failed to upload files')
		}
	},

	async deleteFile(fileUrl: string, fileId: string) {
		try {
			await s3
				.deleteObject({
					Bucket: process.env.AWS_S3_BUCKET_NAME,
					Key: `${fileUrl}`,
				})
				.promise()

			await Files.findByIdAndDelete(fileId)

			return 'File deleted'
		} catch (error) {
			throw new Error(error)
		}
	},
}
