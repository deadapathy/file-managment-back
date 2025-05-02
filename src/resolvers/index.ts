import { User } from "../models/User.js";
import { Folder } from "../models/Folder.js";
import bcrypt from "bcryptjs";
import { createToken } from "../auth/auth.js";
import path from "path";
import fs from "fs/promises";
import AWS from "aws-sdk";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export const resolvers = {
  Upload: GraphQLUpload,

  Query: {
    async listFolders() {
      const baseDir = path.join(process.cwd(), "uploads");
      try {
        const files = await fs.readdir(baseDir, { withFileTypes: true });

        const folders = files
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => ({
            name: dirent.name,
          }));

        return folders;
      } catch (err) {
        console.error("Failed to read folders:", err);
        return [];
      }
    },
  },

  Mutation: {
    register: async (_: any, { username, password }: any) => {
      const existing = await User.findOne({ username });
      if (existing) throw new Error("User already exists");
      if (!password || !username) throw new Error("Fields cannot be empty");

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, password: hashed });

      const token = createToken(user);
      return { id: user._id, username: user.username, token };
    },

    login: async (_: any, { username, password }: any) => {
      const user = await User.findOne({ username });
      if (!user) throw new Error("User not found");

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Invalid password");

      const token = createToken(user);
      return { id: user._id, username: user.username, token };
    },

    createFolder: async (_: any, { folderName }: { folderName: string }) => {
      const existing = await Folder.findOne({ folderName });
      if (existing) throw new Error("Folder already exists");
      if (!folderName) throw new Error("Folder name cannot be empty");

      try {
        const baseDir = path.join(process.cwd(), "uploads");
        const folderPath = path.join(baseDir, folderName);

        await fs.mkdir(folderPath, { recursive: true });
        await Folder.create({ folderName });

        return {
          success: true,
          message: "Folder created",
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "An error occurred",
        };
      }
    },

    multiUpload: async (_: any, { input: { files } }) => {
      try {
        const uploadPromises = files.map(async (file) => {
          const { createReadStream, filename } = await file;
          const stream = createReadStream();
          const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `${filename}`,
            Body: stream,
          };

          const res = await s3.upload(params).promise();
          console.log(`File: ${filename} uploaded successfully`);
          return `Uploaded Location: ${res.Location}`;
        });
        const response = await Promise.all(uploadPromises);
        return JSON.stringify(response);
      } catch (error) {
        console.error("Error uploading files:", error);
        throw new Error("Failed to upload files");
      }
    },
  },
};
