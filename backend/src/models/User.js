import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const addressSchema = new mongoose.Schema(
  {
    province: {
      type: String,
      default: '',
      trim: true,
    },

    district: {
      type: String,
      default: '',
      trim: true,
    },

    municipality: {
      type: String,
      default: '',
      trim: true,
    },

    ward: {
      type: String,
      default: '',
      trim: true,
    },

    tole: {
      type: String,
      default: '',
      trim: true,
    },

    houseNumber: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    _id: false,
  }
)

const userSchema = new mongoose.Schema(
  {
    // =========================
    // Personal Information
    // =========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: String,
      default: '',
      trim: true,
    },

    gender: {
      type: String,
      enum: [
        '',
        'MALE',
        'FEMALE',
        'OTHER',
        'PREFER_NOT_TO_SAY',
      ],
      default: '',
    },

    citizenshipNumber: {
      type: String,
      default: '',
      trim: true,
    },

    citizenshipIssueDate: {
      type: String,
      default: '',
      trim: true,
    },

    citizenshipIssueDistrict: {
      type: String,
      default: '',
      trim: true,
    },

    // =========================
    // Contact Information
    // =========================

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: '',
      trim: true,
    },

    // =========================
    // Permanent Address
    // =========================

    address: {
      type: addressSchema,
      default: () => ({}),
    },

    // =========================
    // Current Address
    // =========================

    currentAddress: {
      type: addressSchema,
      default: () => ({}),
    },

    // =========================
    // Staff / Admin Information
    // =========================

    employeeId: {
      type: String,
      default: '',
      trim: true,
    },

    designation: {
      type: String,
      default: '',
      trim: true,
    },

    // =========================
    // Authentication
    // =========================

    password: {
      type: String,
      required: true,
    },

    // =========================
    // Role & Department
    // =========================

    role: {
      type: String,
      enum: [
        'CITIZEN',
        'STAFF',
        'ADMIN',
      ],
      default: 'CITIZEN',
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },

    departmentName: {
      type: String,
      default: '',
    },

    // =========================
    // Account Status
    // =========================

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  const salt = await bcrypt.genSalt(10)

  this.password = await bcrypt.hash(
    this.password,
    salt
  )

  next()
})

const User = mongoose.model(
  'User',
  userSchema
)

export default User