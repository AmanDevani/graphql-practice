import userResolvers from "./userResolver.js";
import merge from "lodash/merge.js";

const resolvers = merge(userResolvers);

export { resolvers };
