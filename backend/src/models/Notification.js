import mongoose from 'mongoose'

const notificationSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      type: {
        type: String,
        enum: [
          'COMPLAINT_ASSIGNED',
          'STATUS_UPDATED',
          'COMPLAINT_RESOLVED',
          'COMPLAINT_REOPENED',
        ],
        required: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      complaintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
        required: true,
      },

      isRead: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  )

export default mongoose.model(
  'Notification',
  notificationSchema
)