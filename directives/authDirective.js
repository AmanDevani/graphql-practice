import { defaultFieldResolver } from "graphql";
import CustomError from "../utils/CustomError.js";
import getUserById from "../utils/getUserById.js";

const authDirective = (directiveName, schema) => {
  return (fieldConfig) => {
    const { resolve = defaultFieldResolver } = fieldConfig;

    fieldConfig.resolve = async function (source, args, context, info) {
      const { req } = context;
      const authToken = req?.headers?.authorization;
      if (!authToken) {
        throw new CustomError("Please login!");
      }

      const user = await getUserById(authToken);
      if (!user) {
        throw new CustomError("Not Authorized");
      }

      if (user.isActive === false) {
        throw new CustomError("User is Blocked by Admin");
      }

      req.user = user;

      return resolve(source, args, context, info);
    };

    return fieldConfig;
  };
};

export default authDirective;
