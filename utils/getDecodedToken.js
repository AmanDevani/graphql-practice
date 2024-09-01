import jwt from "jsonwebtoken";
import CustomError from "./CustomError.js";

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const getDecodedToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (error, decodedToken) => {
      if (error) {
        if (error.name === "TokenExpiredError") {
          return reject(
            new CustomError("Your Session has expired. Please login again!")
          );
        } else if (error.name === "JsonWebTokenError") {
          return reject(new CustomError("Invalid Token"));
        }
        return reject(new CustomError(error));
      }

      if (!decodedToken.exp || !decodedToken.iat) {
        return reject(new CustomError("Token had no 'exp' or 'iat' payload"));
      }
      return resolve(decodedToken);
    });
  });
export default getDecodedToken;
