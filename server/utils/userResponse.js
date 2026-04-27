export const userResponse = (user) => {
  return {
    _id: user._id,
    id: user._id.toString(), // Add id for frontend compatibility
    name: user.name,
    email: user.email,
    batch: user.batch,
    role: user.role,
    registrationNumber: user.registrationNumber,
    accountVerified: user.accountVerified,
    lastLogin: user.lastLogin,
    avatar: user.avatar,
    interests: user.interests,
    careerGoals: user.careerGoals,
    strengths: user.strengths,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};