import userTypeDefs from "./userTypeDefs.js";
import { mergeTypeDefs } from "@graphql-tools/merge";

const typeDefs = mergeTypeDefs([userTypeDefs]);

export { typeDefs };
