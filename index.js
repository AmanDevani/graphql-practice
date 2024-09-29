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
import introspectionRestrictionMiddleware from "./utils/introspection-restriction-middleware.js";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";

const { json } = pkg;

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Apply body parser middleware before everything else to ensure req.body is populated
app.use(cors());
app.use(json()); // body-parser to handle JSON requests

if (process.env.GRAPHQL_INTROSPECTION_RESTRICTION_ENABLED) {
  app.use("/graphql", introspectionRestrictionMiddleware); // Apply middleware only to /graphql route
}

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
  introspection: process.env.GRAPHQL_INTROSPECTION_RESTRICTION_ENABLED,
  playground: process.env.GRAPHQL_INTROSPECTION_RESTRICTION_ENABLED,
  plugins: [
    process.env.GRAPHQL_INTROSPECTION_RESTRICTION_ENABLED === "true"
      ? ApolloServerPluginLandingPageLocalDefault()
      : ApolloServerPluginLandingPageProductionDefault(),
    ApolloServerPluginDrainHttpServer({ httpServer }),
  ],
  context: ({ req, res }) => {
    return { req, res };
  },
});

// Start the ApolloServer
await server.start();

// Apply Apollo middleware
app.use(
  "/graphql",
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
