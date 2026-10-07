import mongoose from 'mongoose'

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },

    departmentName: {
      type: String,
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    category: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      province: {
        type: String,
        required: true,
        trim: true,
      },

      district: {
        type: String,
        required: true,
        trim: true,
      },

      municipality: {
        type: String,
        required: true,
        trim: true,
      },

      ward: {
        type: String,
        required: true,
        trim: true,
      },

      tole: {
        type: String,
        default: '',
        trim: true,
      },
    },

    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'UNDER_REVIEW',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED',
        'REJECTED',
        'REOPENED',
        'DUPLICATE',
      ],
      default: 'SUBMITTED',
    },

    // ===== PRIORITY =====

    // Current operational priority
    priority: {
      type: String,
      enum: [
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL',
      ],
      default: 'MEDIUM',
    },

    // Original priority recommended by AI
    aiPriority: {
      type: String,
      enum: [
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL',
      ],
      default: null,
    },

    // Numeric score calculated by the AI priority model
    aiPriorityScore: {
      type: Number,
      default: null,
    },

    // Indicates who currently controls the priority
    // AI = original AI recommendation is being used
    // ADMIN = admin manually changed the priority
    prioritySource: {
      type: String,
      enum: ['AI', 'ADMIN'],
      default: 'AI',
    },

    // ===== END PRIORITY =====

    attachments: [
      {
        name: {
          type: String,
          required: true,
        },

        type: {
          type: String,
          default: '',
        },

        size: {
          type: Number,
          default: 0,
        },

        url: {
          type: String,
          required: true,
        },
      },
    ],

    resolution: {
      type: String,
      default: '',
    },

    history: [
      {
        status: {
          type: String,
        },

        note: {
          type: String,
        },

        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ===== AI & MAP FIELDS =====

    coordinates: {
      lat: {
        type: Number,
        default: null,
      },

      lng: {
        type: Number,
        default: null,
      },
    },

    aiSummary: {
      type: String,
      default: '',
    },

    aiConfidence: {
      type: Number,
      default: null,
    },

    needsReview: {
      type: Boolean,
      default: false,
    },

    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },

    upvoteCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

const Complaint = mongoose.model(
  'Complaint',
  complaintSchema
)

export default Complaint