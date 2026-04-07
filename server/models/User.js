import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Admin',
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'admin',
    },
    designation: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    mobile: {
      type: String,
      default: '',
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    memberSince: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  if (!candidatePassword) {
    return false
  }

  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
