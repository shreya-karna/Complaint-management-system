import Feedback from '../models/Feedback.js'
import Complaint from '../models/Complaint.js'

export const createFeedback = async (req, res) => {
  try {
    const { complaintId } = req.params
    const { rating, comment } = req.body

    const numericRating = Number(rating)

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.',
      })
    }

    const complaint =
      await Complaint.findById(complaintId)

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      })
    }

    // Only the citizen who submitted the complaint
    // can give feedback.
    if (
      complaint.userId?.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not authorized to give feedback for this complaint.',
      })
    }

    // Feedback is available only after resolution.
    if (
      !['RESOLVED', 'CLOSED'].includes(
        complaint.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Feedback can only be submitted after the complaint is resolved.',
      })
    }

    // Prevent duplicate feedback.
    const existingFeedback =
      await Feedback.findOne({
        complaintId,
        citizenId: req.user.userId,
      })

    if (existingFeedback) {
      return res.status(409).json({
        success: false,
        message:
          'You have already submitted feedback for this complaint.',
      })
    }

    const feedback = await Feedback.create({
      complaintId,
      citizenId: req.user.userId,
      rating: numericRating,
      comment:
        typeof comment === 'string'
          ? comment.trim()
          : '',
    })

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedback,
    })
  } catch (error) {
    console.error(
      'Create feedback error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback.',
    })
  }
}


export const getComplaintFeedback = async (
  req,
  res
) => {
  try {
    const { complaintId } = req.params

    const complaint =
      await Complaint.findById(complaintId)

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      })
    }

    // Citizens can only access feedback for
    // their own complaint.
    if (
      req.user.role === 'CITIZEN' &&
      complaint.userId?.toString() !==
        req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not authorized to view this feedback.',
      })
    }

    const feedback =
      await Feedback.findOne({
        complaintId,
      }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      feedback,
    })
  } catch (error) {
    console.error(
      'Get complaint feedback error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Failed to fetch complaint feedback.',
    })
  }
}


/*
 * ADMIN
 * Get feedback from all complaints.
 */
export const getAllFeedback = async (
  req,
  res
) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message:
          'Only administrators can view all feedback.',
      })
    }

    const feedback =
      await Feedback.find()
        .populate(
          'complaintId',
          'complaintNumber title departmentName status'
        )
        .populate(
          'citizenId',
          'name email'
        )
        .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      feedback,
    })
  } catch (error) {
    console.error(
      'Get all feedback error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Failed to fetch feedback.',
    })
  }
}


/*
 * STAFF
 * Get feedback for complaints assigned
 * to the currently logged-in staff member.
 */
export const getStaffFeedback = async (
  req,
  res
) => {
  try {
    if (req.user.role !== 'STAFF') {
      return res.status(403).json({
        success: false,
        message:
          'Only staff members can access this feedback.',
      })
    }

    const complaints =
      await Complaint.find({
        assignedTo: req.user.userId,
      }).select('_id')

    const complaintIds =
      complaints.map(
        (complaint) => complaint._id
      )

    const feedback =
      await Feedback.find({
        complaintId: {
          $in: complaintIds,
        },
      })
        .populate(
          'complaintId',
          'complaintNumber title departmentName status'
        )
        .populate(
          'citizenId',
          'name email'
        )
        .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      feedback,
    })
  } catch (error) {
    console.error(
      'Get staff feedback error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Failed to fetch staff feedback.',
    })
  }
}
