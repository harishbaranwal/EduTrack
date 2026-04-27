import User from "../models/user.model.js";
import { validateFields } from "../utils/validateFields.js";
import { validatePassword } from "../utils/validatePassword.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendEmail } from "../utils/sendEmail.js";
import { forgotPasswordEmail } from "../utils/emailTemplates.js";
import { sendToken } from "../utils/sendToken.js";
import { userResponse } from "../utils/userResponse.js";
import { generateRegistrationNumber } from "../utils/generateRegistrationNumber.js";


// Register Controller
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Field validation
    const validationError = validateFields({ name, email, password });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // 2. Already registered & verified
    const isRegistered = await User.findOne({ email, accountVerified: true });
    if (isRegistered) {
      return res
        .status(400)
        .json({ success: false, message: "Account already exists" });
    }

    // 3. Check for existing unverified accounts
    const existingUnverifiedUser = await User.findOne({
      email,
      accountVerified: false,
    });

    // 5. Password validation
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      return res
        .status(400)
        .json({ success: false, message: passwordValidationError });
    }

    let user;
    let verificationCode;

    // 6. Update existing unverified user or create new one
    if (existingUnverifiedUser) {
      existingUnverifiedUser.name = name;
      existingUnverifiedUser.password = password;
      
      // Generate registration number if not exists
      if (!existingUnverifiedUser.registrationNumber) {
        const registrationNumber = await generateRegistrationNumber("Student");
        existingUnverifiedUser.registrationNumber = registrationNumber;
      }
      
      // Generate new verification code
      verificationCode = existingUnverifiedUser.generateVerificationCode();
      await existingUnverifiedUser.save();
      user = existingUnverifiedUser;
    } else {
      // Create new user with default role "Student"
      // Generate registration number for student (format: 1YYXXXX)
      const registrationNumber = await generateRegistrationNumber("Student");
      
      user = new User({ 
        name, 
        email, 
        password,
        role: "Student", 
        registrationNumber 
      });
      verificationCode = user.generateVerificationCode();
      await user.save();
    }

    // 7. Send verification code
    try {
      await sendVerificationCode(verificationCode, email);
      const message = existingUnverifiedUser 
        ? "verification code sent to your email."
        : "Verification code sent to your email.";
      
      return res.status(201).json({
        success: true,
        message: message,
      });
    } catch (emailError) {

      const message = existingUnverifiedUser
        ? "Registration updated successfully, but failed to send verification code. Please try again later."
        : "Account created successfully, but failed to send verification code. Please try again later.";
      
      return res.status(201).json({
        success: true,
        message: message,
      });
    }
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify Otp Controller
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email or OTP is missing",
      });
    }

    const users = await User.find({
      email,
      accountVerified: false,
    })
      .sort({ createdAt: -1 })
      .select("+verificationCode +verificationCodeExpire");

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or already verified",
      });
    }

    let user;
    if (users.length > 1) {
      user = users[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        email,
        accountVerified: false,
      });
    } else {
      user = users[0];
    }

    // Compare as string
    if (user.verificationCode !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const currentTime = Date.now();
    const verificationCodeExpire = new Date(
      user.verificationCodeExpire
    ).getTime();

    if (currentTime > verificationCodeExpire) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;

    await user.save({ validateModifiedOnly: true });
    
    // Don't send token - user should login after verification
    return res.status(200).json({
      success: true,
      message: "Account verified successfully. Please login to continue."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const validationError = validateFields({ email, password });
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const user = await User.findOne({
      email,
      accountVerified: true,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const userWithBatch = await User.findById(user._id).populate('batch', 'name');
    sendToken(userWithBatch, 200, "Login Successfully", res);
    
  } catch (err) {

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// logout Controller
export const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    res.status(200).json({
      success: true,
      message: "Logged out Successfully",
    });
  } catch (err) {

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getUser Controller
export const getUser = async (req, res) => {
  try {
    // Populate the batch information with correct fields
    const userWithBatch = await User.findById(req.user._id).populate('batch', 'name');
    const response = userResponse(userWithBatch);

    res.status(200).json({
      success: true,
      user: response,
    });
  } catch (err) {

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// forgot Password Controller
export const forgotPassword = async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({
      success: false,
      message: "Please enter email",
    });
  }

  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetPasswordUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const message = forgotPasswordEmail(resetPasswordUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "Smart System Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      success: false,
      message: `Email could not be sent: ${error.message}`,
    });
  }
};

// validateResetToken Controller
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findByResetToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset password token is invalid or has expired",
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// resetPassword Controller
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findByResetToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset password token is invalid or has expired",
      });
    }

    const { newPassword, confirmNewPassword } = req.body;
    const validationError = validateFields({
      newPassword,
      confirmNewPassword,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const passwordValidationError = validatePassword(
      newPassword,
      confirmNewPassword
    );

    if (passwordValidationError) {
      return res.status(400).json({
        success: false,
        message: passwordValidationError,
      });
    }

    // Set new password (will be hashed by pre-save middleware)
    user.password = newPassword;

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// updatePassword Controller
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const validationError = validateFields({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const isPasswordMatched = await user.comparePassword(currentPassword);

    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const passwordValidationError = validatePassword(
      newPassword,
      confirmNewPassword
    );
    if (passwordValidationError) {
      return res.status(400).json({
        success: false,
        message: passwordValidationError,
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// updateProfile Controller
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, interests, careerGoals, strengths } = req.body;

    // Update allowed fields
    if (name) user.name = name;
    
    // Student-specific fields - only update if user is a Student
    if (user.role === "Student") {
      if (interests !== undefined) {
        if (Array.isArray(interests)) {
          user.interests = interests;
        } else {
          return res.status(400).json({
            success: false,
            message: "Interests must be an array",
          });
        }
      }
      if (careerGoals !== undefined) {
        if (Array.isArray(careerGoals)) {
          if (careerGoals.length > 2) {
            return res.status(400).json({
              success: false,
              message: "You can select maximum 2 career goals",
            });
          }
          user.careerGoals = careerGoals;
        } else {
          return res.status(400).json({
            success: false,
            message: "Career goals must be an array",
          });
        }
      }
      if (strengths !== undefined) {
        if (Array.isArray(strengths)) {
          user.strengths = strengths;
        } else {
          return res.status(400).json({
            success: false,
            message: "Strengths must be an array",
          });
        }
      }
      // Registration number is auto-generated during registration, cannot be updated
    }

    await user.save({ validateModifiedOnly: true });

    const updatedUser = await User.findById(user._id).populate('batch', 'name');
    const response = userResponse(updatedUser);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: response,
    });
  } catch (error) {
    // Handle duplicate registration number error (should not happen as it's auto-generated)
    if (error.code === 11000 && error.keyPattern?.registrationNumber) {
      return res.status(400).json({
        success: false,
        message: "Registration number conflict. Please contact support.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// resendOTP Controller
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find the most recent unverified user
    const user = await User.findOne({
      email,
      accountVerified: false,
    }).sort({ createdAt: -1 });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No pending verification found for this email",
      });
    }

    // Generate new verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Send verification code
    try {
      await sendVerificationCode(verificationCode, email);
      return res.status(200).json({
        success: true,
        message: "Verification code resent successfully",
      });
    } catch (emailError) {

      return res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again later.",
      });
    }
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
