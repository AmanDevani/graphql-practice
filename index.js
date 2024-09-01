import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";
import http from "http";
import cors from "cors";
import pkg from "body-parser";
import { connectToDatabase } from "./db/connection.js";
import { typeDefs } from "./typeDefs/index.js";
import { resolvers } from "./resolvers/index.js";
import applyDirective from "./directives/index.js";

const { json } = pkg;

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Create the schema
let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Apply the directive
schema = applyDirective(schema);

// Initialize ApolloServer with the schema
const server = new ApolloServer({
  schema,
  context: ({ req, res }) => {
    return { req, res };
  },
});

// Start the ApolloServer
await server.start();

// Apply middleware
app.use(
  "/graphql",
  cors(),
  json(),
  expressMiddleware(server, {
    context: ({ req, res }) => {
      return { req, res };
    },
  })
);

// Start the server and database connection
const startServer = async () => {
  try {
    await connectToDatabase();
    httpServer.listen(PORT, () => {
      console.log(`Standalone server started at port ${PORT}`);
    });
  } catch (error) {
    console.log(
      "Failed to start server due to database connection error:",
      error
    );
  }
};

startServer();
