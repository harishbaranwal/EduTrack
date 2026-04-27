import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Teacher", "Student"],
      default: "Student",
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true, 
    },
    interests: {
      type: [String],
      default: [],
    },
    careerGoals: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 2;
        },
        message: 'You can select maximum 2 career goals'
      }
    },
    strengths: {
      type: [String],
      default: [],
    },
    avatar: {
      public_id: String,
      url: String,
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeExpire: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for id (compatibility with frontend)
userSchema.virtual('id').get(function() {
  return this._id.toString();
});

// password Hashing

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 5-digit verification code
userSchema.methods.generateVerificationCode = function () {
  const code = Math.random().toString().slice(2, 7);
  this.verificationCode = code;
  this.verificationCodeExpire = Date.now() + 15 * 60 * 1000;
  return code;
};

// JWT Token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES || "1d",
    }
  );
};

// Reset password token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

// Find by reset token
userSchema.statics.findByResetToken = function (token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return this.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpire +verificationCode");
};
export default mongoose.model("User", userSchema);
