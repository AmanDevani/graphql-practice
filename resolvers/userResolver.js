import { User } from "../schema/index.js";
import CustomError from "../utils/CustomError.js";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

const getUsers = async (_, args) => {
  try {
    const {
      sort: { field = "createdAt", order = "DESC" } = {},
      filter: { skip = 0, limit = 20, searchTerm = "", isDeleted = true } = {},
    } = args;

    const sortOrder = order === "ASC" ? 1 : -1;

    const query = {};

    if (searchTerm) {
      query.$or = [
        { firstName: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ];
    }
    if (typeof isDeleted === "boolean") {
      query.isDeleted = isDeleted;
    }

    const users = await User.find(query)
      .sort({ [field]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();

    const count = await User.countDocuments();

    return { user: users, count };
  } catch (error) {
    throw new CustomError(error.message, error.code || 500);
  }
};

const getUser = async (_, args) => {
  try {
    const { where } = args;
    const { id } = where;
    if (!id.trim() || !id) {
      throw new CustomError("Missing Required Fields");
    }
    if (!ObjectId.isValid(id)) {
      throw new CustomError("Invalid ID format");
    }
    const user = await User.findById(id);
    if (!user) {
      throw new CustomError("User not found");
    }
    return user;
  } catch (error) {
    throw new CustomError(error.message, error.code || 500);
  }
};

const loginUser = async (_, { input }) => {
  const { email, password } = input;
  try {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) return new CustomError("User Not Found");
    const isPasswordMatch = await user.isPasswordCorrect(password);
    if (!isPasswordMatch) return new CustomError("Incorrect Password");
    const token = await user.generateToken();
    return { message: "Logged in successfully", token };
  } catch (error) {
    throw new CustomError(error.message, error.code || 500);
  }
};

const register = async (_, { input }) => {
  try {
    const isAlreadyUser = await User.findOne({ email: input.email });
    if (isAlreadyUser) {
      throw new CustomError("Email is already exist");
    }
    const savedUser = await User.create(input);
    const response = {
      message: "Account Created successfully",
      user: savedUser,
    };

    return response;
  } catch (error) {
    throw new CustomError(error.message, error.code || 500);
  }
};
const userResolvers = {
  Query: {
    getUsers,
    getUser,
  },

  Mutation: {
    loginUser,
    register,
  },
};

export default userResolvers;
