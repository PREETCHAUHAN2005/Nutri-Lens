/**
 * User Model
 *
 * Defines the user schema for authentication and personalization.
 * Stores user preferences for AI-driven intent inference.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Authentication fields
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password in queries by default
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    // User preferences for AI intent inference
    preferences: {
      // Dietary preferences
      dietaryRestrictions: {
        type: [String],
        enum: [
          "vegetarian",
          "vegan",
          "gluten-free",
          "dairy-free",
          "nut-free",
          "halal",
          "kosher",
        ],
        default: [],
      },

      // Health goals inferred from usage patterns
      healthGoals: {
        type: [String],
        enum: [
          "weight-loss",
          "muscle-gain",
          "heart-health",
          "diabetes-management",
          "general-wellness",
        ],
        default: [],
      },

      // Allergens to watch for
      allergens: {
        type: [String],
        default: [],
      },

      // Preferred analysis depth
      analysisDetail: {
        type: String,
        enum: ["quick", "standard", "comprehensive"],
        default: "standard",
      },
    },

    // User behavior tracking for intent inference
    behaviorProfile: {
      // Most scanned product categories
      frequentCategories: [
        {
          category: String,
          count: Number,
        },
      ],

      // Common concerns expressed in conversations
      commonConcerns: [String],

      // Time of day patterns for contextual insights
      scanPatterns: {
        morning: { type: Number, default: 0 },
        afternoon: { type: Number, default: 0 },
        evening: { type: Number, default: 0 },
        night: { type: Number, default: 0 },
      },
    },

    // Account metadata
    isVerified: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to get user profile without sensitive data
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    preferences: this.preferences,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = User;
