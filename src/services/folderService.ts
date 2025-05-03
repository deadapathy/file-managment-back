import { s3 } from '../config/aws.js'
import { Folders } from '../models/Folders.js'
import { Files } from '../models/Files.js'

export const folderService = {
	async getAllFolders() {
		return await Folders.find().sort({ uploadedAt: -1 })
	},

	async createFolder(folderName: string) {
		const existing = await Folders.findOne({ name: folderName })
		if (existing) throw new Error('Folder already exists')
		if (!folderName) throw new Error('Folder name cannot be empty')

		try {
			const params = {
				Bucket: process.env.AWS_S3_BUCKET_NAME,
				Key: `${folderName}/`,
				Body: '',
			}

			const res = await s3.upload(params).promise()

			await Folders.create({
				name: folderName,
				size: 0,
				url: res.Location,
				uploadedAt: new Date(),
			})

			return {
				success: true,
				message: 'Folder created',
			}
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'An error occurred',
			}
		}
	},

	async deleteFolder(folderUrl: string, folderId: string) {
		const listParams = {
			Bucket: process.env.AWS_S3_BUCKET_NAME,
			Prefix: folderUrl,
		}

		const listedObjects = await s3.listObjectsV2(listParams).promise()

		try {
			if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
				await s3
					.deleteObject({
						Bucket: process.env.AWS_S3_BUCKET_NAME,
						Key: `${folderUrl}`,
					})
					.promise()
			} else {
				const deleteParams = {
					Bucket: process.env.AWS_S3_BUCKET_NAME,
					Delete: {
						Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
					},
				}
				await s3.deleteObjects(deleteParams).promise()
			}

			await Files.deleteMany({ folderId })
			await Folders.findByIdAndDelete(folderId)

			return 'Folder deleted'
		} catch (error) {
			throw new Error(error)
		}
	},
}
