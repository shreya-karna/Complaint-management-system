import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

import User from '../models/User.js'
import Department from '../models/Department.js'
import { sendVerificationEmail } from '../utils/emailService.js'

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error('Get users error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
    })
  }
}

export const createUser = async (req, res) => {
  try {
    const {
      name,
      dateOfBirth,
      gender,
      citizenshipNumber,
      citizenshipIssueDate,
      citizenshipIssueDistrict,
      email,
      phone,
      address,
      currentAddress,
      employeeId,
      designation,
      password,
      role,
      departmentId,
    } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message:
          'Name, email, password and role are required.',
      })
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          'A user with this email already exists.',
      })
    }

    let departmentName = ''

    if (departmentId) {
      const department = await Department.findById(
        departmentId
      )

      if (!department) {
        return res.status(400).json({
          success: false,
          message:
            'Selected department does not exist.',
        })
      }

      departmentName = department.name
    }

    // Create email verification token
    const emailVerificationToken =
      crypto.randomBytes(32).toString('hex')

    // Verification link expires after 24 hours
    const emailVerificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    )

    const user = await User.create({
      name: name.trim(),

      dateOfBirth:
        dateOfBirth?.trim() || '',

      gender:
        gender || '',

      citizenshipNumber:
        citizenshipNumber?.trim() || '',

      citizenshipIssueDate:
        citizenshipIssueDate?.trim() || '',

      citizenshipIssueDistrict:
        citizenshipIssueDistrict?.trim() || '',

      email: email.toLowerCase().trim(),

      // Email verification fields
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,

      phone: phone?.trim() || '',

      address: {
        province:
          address?.province?.trim() || '',

        district:
          address?.district?.trim() || '',

        municipality:
          address?.municipality?.trim() || '',

        ward:
          address?.ward?.trim() || '',

        tole:
          address?.tole?.trim() || '',

        houseNumber:
          address?.houseNumber?.trim() || '',
      },

      currentAddress: {
        province:
          currentAddress?.province?.trim() || '',

        district:
          currentAddress?.district?.trim() || '',

        municipality:
          currentAddress?.municipality?.trim() || '',

        ward:
          currentAddress?.ward?.trim() || '',

        tole:
          currentAddress?.tole?.trim() || '',

        houseNumber:
          currentAddress?.houseNumber?.trim() || '',
      },

      employeeId:
        employeeId?.trim() || '',

      designation:
        designation?.trim() || '',

      password,

      role,

      departmentId:
        departmentId || null,

      departmentName,
    })

    // Create verification URL
    const verificationUrl =
      `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`

    // Send verification email
    await sendVerificationEmail(
      user.email,
      verificationUrl
    )

    const userResponse = user.toObject()

    delete userResponse.password
    delete userResponse.emailVerificationToken
    delete userResponse.emailVerificationExpires

    res.status(201).json({
      success: true,
      message:
        'Registration successful. Please check your email to verify your account.',
      user: userResponse,
    })
  } catch (error) {
    console.error('Create user error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to create user.',
    })
  }
}

// Verify email address
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.',
      })
    }

    const user = await User.findOne({
      emailVerificationToken: token,
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid or expired verification link.',
      })
    }

    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'This verification link has expired.',
      })
    }

    user.isEmailVerified = true
    user.emailVerificationToken = null
    user.emailVerificationExpires = null

    await user.save()

    res.status(200).json({
      success: true,
      message:
        'Email verified successfully. You can now log in.',
    })
  } catch (error) {
    console.error('Email verification error:', error)

    res.status(500).json({
      success: false,
      message:
        'Failed to verify email address.',
    })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params

    const {
      name,
      dateOfBirth,
      gender,
      citizenshipNumber,
      citizenshipIssueDate,
      citizenshipIssueDistrict,
      email,
      phone,
      address,
      currentAddress,
      employeeId,
      designation,
      password,
      role,
      departmentId,
      isActive,
    } = req.body

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    if (email) {
      const normalizedEmail =
        email.toLowerCase().trim()

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            'Another user with this email already exists.',
        })
      }

      user.email = normalizedEmail
    }

    if (name !== undefined) {
      user.name = name.trim()
    }

    if (dateOfBirth !== undefined) {
      user.dateOfBirth = dateOfBirth.trim()
    }

    if (gender !== undefined) {
      user.gender = gender
    }

    if (citizenshipNumber !== undefined) {
      user.citizenshipNumber =
        citizenshipNumber.trim()
    }

    if (citizenshipIssueDate !== undefined) {
      user.citizenshipIssueDate =
        citizenshipIssueDate.trim()
    }

    if (citizenshipIssueDistrict !== undefined) {
      user.citizenshipIssueDistrict =
        citizenshipIssueDistrict.trim()
    }

    if (phone !== undefined) {
      user.phone = phone.trim()
    }

    if (address !== undefined) {
      user.address = {
        province:
          address?.province?.trim() || '',

        district:
          address?.district?.trim() || '',

        municipality:
          address?.municipality?.trim() || '',

        ward:
          address?.ward?.trim() || '',

        tole:
          address?.tole?.trim() || '',

        houseNumber:
          address?.houseNumber?.trim() || '',
      }
    }

    if (currentAddress !== undefined) {
      user.currentAddress = {
        province:
          currentAddress?.province?.trim() || '',

        district:
          currentAddress?.district?.trim() || '',

        municipality:
          currentAddress?.municipality?.trim() || '',

        ward:
          currentAddress?.ward?.trim() || '',

        tole:
          currentAddress?.tole?.trim() || '',

        houseNumber:
          currentAddress?.houseNumber?.trim() || '',
      }
    }

    if (employeeId !== undefined) {
      user.employeeId = employeeId.trim()
    }

    if (designation !== undefined) {
      user.designation = designation.trim()
    }

    if (password) {
      user.password = password
    }

    if (role) {
      user.role = role
    }

    if (departmentId !== undefined) {
      if (departmentId) {
        const department =
          await Department.findById(
            departmentId
          )

        if (!department) {
          return res.status(400).json({
            success: false,
            message:
              'Selected department does not exist.',
          })
        }

        user.departmentId = department._id
        user.departmentName = department.name
      } else {
        user.departmentId = null
        user.departmentName = ''
      }
    }

    if (isActive !== undefined) {
      user.isActive = isActive
    }

    await user.save()

    const userResponse = user.toObject()

    delete userResponse.password

    res.json({
      success: true,
      message: 'User updated successfully.',
      user: userResponse,
    })
  } catch (error) {
    console.error('Update user error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to update user.',
    })
  }
}

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).populate('departmentId', 'name')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive.',
      })
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          'Please verify your email before logging in.',
      })
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        departmentId:
          user.departmentId?._id || null,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    )

    const userResponse = user.toObject()

    delete userResponse.password

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: userResponse,
    })
  } catch (error) {
    console.error('Login error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to login.',
    })
  }
}

export const getStaffByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required.',
      })
    }

    const staff = await User.find({
      role: 'STAFF',
      departmentId,
    })
      .select('-password')
      .sort({ name: 1 })

    res.status(200).json({
      success: true,
      staff,
    })
  } catch (error) {
    console.error(
      'Get staff by department error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch department staff.',
    })
  }
}

// Resend email verification
export const resendVerificationEmail = async (
  req,
  res
) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      })
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email.',
      })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified.',
      })
    }

    const emailVerificationToken =
      crypto.randomBytes(32).toString('hex')

    const emailVerificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    )

    user.emailVerificationToken =
      emailVerificationToken

    user.emailVerificationExpires =
      emailVerificationExpires

    await user.save()

    const verificationUrl =
      `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`

    await sendVerificationEmail(
      user.email,
      verificationUrl
    )

    res.status(200).json({
      success: true,
      message:
        'Verification email sent. Please check your email.',
    })
  } catch (error) {
    console.error(
      'Resend verification email error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Failed to send verification email.',
    })
  }
}