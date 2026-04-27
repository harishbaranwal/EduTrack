export const validatePassword = (password, confirmPassword = null) => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8 || password.length > 20) {
    return "Password must be between 8 to 20 characters long";
  }
  if (confirmPassword !== null && password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
};
