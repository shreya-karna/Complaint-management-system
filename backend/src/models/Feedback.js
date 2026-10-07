import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
    },

    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// One feedback per citizen for each complaint
feedbackSchema.index(
  { complaintId: 1, citizenId: 1 },
  { unique: true }
)

const Feedback = mongoose.model(
  'Feedback',
  feedbackSchema
)

export default Feedback