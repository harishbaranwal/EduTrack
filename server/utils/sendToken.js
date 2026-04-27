import { userResponse } from "./userResponse.js";

export const sendToken = (user, statusCode, message, res) => {
  const token = user.generateToken();
  const response = userResponse(user);
  
  const options = {
    expires: new Date(
      Date.now() + (process.env.COOKIE_EXPIRE || 24) * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite:  "None",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user: response,
  });
};
