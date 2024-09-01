import getDecodedToken from "./getDecodedToken.js";
import CustomError from "../utils/CustomError.js";
import { User } from "../schema/index.js";

const getUserById = async (token) => {
  if (!token) {
    throw new CustomError("Please login!");
  }

  if (!token.startsWith("Bearer ")) {
    throw new CustomError("Invalid token!");
  }

  const authToken = token.slice(7, token.length);
  try {
    const decodedToken = await getDecodedToken(authToken);
    const userId = decodedToken?._id;

    if (!userId) {
      throw new CustomError("Please login!");
    }

    const user = await User.findById(userId); // Fetch user by ID from your database

    if (!user) {
      throw new CustomError("User not found!");
    }

    return user;
  } catch (error) {
    throw new CustomError(error.message, error.code || 500);
  }
};

export default getUserById;
