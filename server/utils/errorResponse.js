export const sendErrorResponse = (res, statusCode = 500, message = "Internal server error") => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const sendSuccessResponse = (res, statusCode = 200, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};
