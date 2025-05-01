import "reflect-metadata";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

dotenv.config();

const startServer = async () => {
  const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }
`;

  const books = [
    {
      title: "The Awakening",
      author: "Kate Chopin",
    },
    {
      title: "City of Glass",
      author: "Paul Auster",
    },
  ];

  const resolvers = {
    Query: {
      books: () => books,
    },
  };

  const MONGODB_URI = process.env.MONGODB_URI;

  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const PORT = process.env.PORT;

  const { url } = await startStandaloneServer(server, {
    listen: { port: +PORT },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

startServer().catch((error) => {
  console.error("❌ Error starting server:", error);
});
