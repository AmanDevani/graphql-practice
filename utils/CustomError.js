class CustomError extends Error {
  constructor(message, code = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
