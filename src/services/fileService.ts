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

			const response = await Promise.all(uploadPromises)
			return JSON.stringify(response)
		} catch (error) {
			throw new Error(error)
		}
	},

	async downloadFiles(key: string) {
		const params = {
			Bucket: process.env.AWS_S3_BUCKET_NAME,
			Key: key,
			Expires: 60,
		}

		try {
			const url = await s3.getSignedUrlPromise('getObject', params)
			return url
		} catch (error) {
			throw new Error(error)
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
	async renameFile(
		oldKey: string,
		newKey: string,
		fileId: string,
		newName: string,
		type: string
	) {
		const Bucket = process.env.AWS_S3_BUCKET_NAME
		const Region = process.env.AWS_REGION

		try {
			await s3
				.copyObject({
					Bucket,
					CopySource: `${Bucket}/${oldKey}`,
					Key: newKey,
				})
				.promise()

			await s3.deleteObject({ Bucket, Key: oldKey }).promise()

			if (type === 'folder') {
				await Folders.findByIdAndUpdate(fileId, {
					name: newName,
					url: `https://${Bucket}.s3.${Region}.amazonaws.com/${newKey}`,
				})
			} else {
				await Files.findByIdAndUpdate(fileId, {
					name: newName,
					url: `https://${Bucket}.s3.${Region}.amazonaws.com/${newKey}`,
				})
			}

			return 'File updated'
		} catch (error) {
			throw new Error(error)
		}
	},
	async searchFiles(query: string) {
		if (!query) {
			const folders = await Folders.find().sort({ uploadedAt: -1 })
			const files = await Files.find().sort({ uploadedAt: -1 })

			return [...files, ...folders]
		}

		const regex = new RegExp(query, 'i')

		const files = await Files.find({
			name: { $regex: regex },
		})

		const folders = await Folders.find({
			name: { $regex: regex },
		})

		return [...files, ...folders]
	},

	async fileMove(
		oldKey: string,
		newKey: string,
		fileId: string,
		newFolderId: string
	) {
		const Bucket = process.env.AWS_S3_BUCKET_NAME
		const Region = process.env.AWS_REGION

		try {
			await s3
				.copyObject({
					Bucket,
					CopySource: `${Bucket}/${oldKey}`,
					Key: newKey,
				})
				.promise()

			await s3.deleteObject({ Bucket, Key: oldKey }).promise()

			await Files.findByIdAndUpdate(fileId, {
				folderId: newFolderId,
				url: `https://${Bucket}.s3.${Region}.amazonaws.com/${newKey}`,
			})

			return 'File moved'
		} catch (error) {
			throw new Error(error)
		}
	},
}
