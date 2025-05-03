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

// export const resolvers = {
//   Upload: GraphQLUpload,

//   Query: {
//     async files(_: any, args: { folderId?: string }) {
//       const { folderId } = args;
//       const filter = folderId ? { folderId } : {};
//       return await Files.find(filter).sort({ uploadedAt: -1 });
//     },
//     async folders() {
//       return await Folders.find().sort({ uploadedAt: -1 });
//     },
//   },

//   Mutation: {
//     register: async (_: any, { username, password }: any) => {
//       const existing = await User.findOne({ username });
//       if (existing) throw new Error("User already exists");
//       if (!password || !username) throw new Error("Fields cannot be empty");

//       const hashed = await bcrypt.hash(password, 10);
//       const user = await User.create({ username, password: hashed });

//       const token = createToken(user);
//       return { id: user._id, username: user.username, token };
//     },

//     login: async (_: any, { username, password }: any) => {
//       const user = await User.findOne({ username });
//       if (!user) throw new Error("User not found");

//       const isValid = await bcrypt.compare(password, user.password);
//       if (!isValid) throw new Error("Invalid password");

//       const token = createToken(user);
//       return { id: user._id, username: user.username, token };
//     },

//     createFolder: async (_: any, { folderName }: { folderName: string }) => {
//       const existing = await Folders.findOne({ name: folderName });
//       if (existing) throw new Error("Folder already exists");
//       if (!folderName) throw new Error("Folder name cannot be empty");

//       try {
//         const params: AWS.S3.PutObjectRequest = {
//           Bucket: process.env.AWS_S3_BUCKET_NAME as string,
//           Key: `${folderName}/`,
//           Body: "",
//         };

//         const res: S3UploadResponse = await s3.upload(params).promise();

//         await Folders.create({
//           name: folderName,
//           size: 0,
//           url: res.Location,
//           uploadedAt: new Date(),
//         });

//         return {
//           success: true,
//           message: "Folder created",
//         };
//       } catch (error) {
//         return {
//           success: false,
//           message: error instanceof Error ? error.message : "An error occurred",
//         };
//       }
//     },

//     multiUpload: async (_: any, { input: { files }, folderId }) => {
//       try {
//         let folderName = "";

//         if (folderId) {
//           const folder = await Folders.findById(folderId);
//           if (!folder) throw new Error("Folder not found");
//           folderName = folder.name;
//         }

//         const uploadPromises: Promise<string>[] = files.map(
//           async (file: Promise<UploadFile>) => {
//             const { createReadStream, filename, mimetype } =
//               (await file) as UploadFile;

//             const stream: NodeJS.ReadableStream = createReadStream();
//             const buffer = await new Promise<Buffer>((resolve, reject) => {
//               const chunks: Buffer[] = [];
//               stream.on("data", (chunk) => chunks.push(chunk));
//               stream.on("end", () => resolve(Buffer.concat(chunks)));
//               stream.on("error", reject);
//             });

//             const filePath = folderName
//               ? `${folderName}/${filename}`
//               : filename;

//             const params: AWS.S3.PutObjectRequest = {
//               Bucket: process.env.AWS_S3_BUCKET_NAME as string,
//               Key: `${filePath}`,
//               Body: buffer,
//             };

//             const res: S3UploadResponse = await s3.upload(params).promise();
//             await Files.create({
//               name: filename,
//               size: buffer.length,
//               type: mimetype,
//               url: res.Location,
//               uploadedAt: new Date(),
//               folderId: folderId,
//             });

//             return `Uploaded Location: ${res.Location}`;
//           }
//         );

//         const response = await Promise.all(uploadPromises);
//         return JSON.stringify(response);
//       } catch (error) {
//         throw new Error("Failed to upload files");
//       }
//     },
//     deleteFile: async (_: any, { fileUrl, fileId }) => {
//       try {
//         await s3
//           .deleteObject({
//             Bucket: process.env.AWS_S3_BUCKET_NAME as string,
//             Key: `${fileUrl}`,
//           })
//           .promise();

//         await Files.findByIdAndDelete(fileId);

//         return "File deleted";
//       } catch (error) {
//         throw new Error(error);
//       }
//     },
//     deleteFolder: async (_: any, { folderUrl, folderId }) => {
//       const listParams = {
//         Bucket: process.env.AWS_S3_BUCKET_NAME as string,
//         Prefix: folderUrl,
//       };

//       const listedObjects = await s3.listObjectsV2(listParams).promise();

//       try {
//         if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
//           await s3
//             .deleteObject({
//               Bucket: process.env.AWS_S3_BUCKET_NAME as string,
//               Key: `${folderUrl}`,
//             })
//             .promise();
//         } else {
//           const deleteParams = {
//             Bucket: process.env.AWS_S3_BUCKET_NAME as string,
//             Delete: {
//               Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
//             },
//           };
//           await s3.deleteObjects(deleteParams).promise();
//         }

//         await Files.deleteMany({ folderId });
//         await Folders.findByIdAndDelete(folderId);

//         return "Folder deleted";
//       } catch (error) {
//         throw new Error(error);
//       }
//     },
//   },
// };

/* This code block is defining the resolvers for a GraphQL schema. Resolvers are functions that are
responsible for fetching the data for each GraphQL query. In this case, the resolvers are structured
as follows: */
export const resolvers = {
	Upload: GraphQLUpload,

	Query: {
		async files(_: any, args: { folderId?: string }) {
			return await fileService.getAllFiles(args.folderId)
		},
		async folders() {
			return await folderService.getAllFolders()
		},
	},

	Mutation: {
		register: async (_: any, { username, password }: UserType) => {
			return await userService.register(username, password)
		},

		login: async (_: any, { username, password }: UserType) => {
			return await userService.login(username, password)
		},

		createFolder: async (_: any, { folderName }: { folderName: string }) => {
			return await folderService.createFolder(folderName)
		},

		multiUpload: async (
			_: any,
			{ input: { files }, folderId }: MultiUploadType
		) => {
			return await fileService.uploadFiles(files, folderId)
		},

		deleteFile: async (_: any, { fileUrl, fileId }: DeleteFileType) => {
			return await fileService.deleteFile(fileUrl, fileId)
		},

		deleteFolder: async (_: any, { folderUrl, folderId }: DeleteFolderType) => {
			return await folderService.deleteFolder(folderUrl, folderId)
		},
	},
}
