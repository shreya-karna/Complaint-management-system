import Complaint from '../models/Complaint.js'
import User from '../models/User.js'
import { analyzeNewComplaint } from '../services/aiPipeline.js'

const generateComplaintNumber = async () => {
  const year = new Date().getFullYear()

  const latestComplaint = await Complaint.findOne({
    complaintNumber: {
      $regex: `^CMP-${year}-`,
    },
  }).sort({ createdAt: -1 })

  let nextNumber = 1

  if (latestComplaint) {
    const lastNumber = parseInt(
      latestComplaint.complaintNumber.split('-')[2],
      10
    )

    nextNumber = lastNumber + 1
  }

  return `CMP-${year}-${String(nextNumber).padStart(6, '0')}`
}

export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      location,
    } = req.body

    let department

    try {
      department =
        typeof req.body.department === 'string'
          ? JSON.parse(req.body.department)
          : req.body.department
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department data.',
      })
    }

    if (
      !department ||
      !department.id ||
      !department.name
    ) {
      return res.status(400).json({
        success: false,
        message: 'Department is required.',
      })
    }

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Complaint title is required.',
      })
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required.',
      })
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required.',
      })
    }

    if (!location?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Location is required.',
      })
    }

    // ===== AI & MAP =====
    const latNum = parseFloat(req.body.lat)
    const lngNum = parseFloat(req.body.lng)
    const hasCoords = Number.isFinite(latNum) && Number.isFinite(lngNum)

    const ai = await analyzeNewComplaint({
      text: description.trim(),
      category,
      departmentId: department.id,
      lat: hasCoords ? latNum : null,
      lng: hasCoords ? lngNum : null,
      address: req.body.address || '',
    })
    // ===== END AI & MAP =====

    const complaintNumber =
      await generateComplaintNumber()

    const attachments = (
      req.files || []
    ).map((file) => ({
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
    }))

    const complaint = await Complaint.create({
      complaintNumber,

      // Get the logged-in user's ID from the JWT
      userId: req.user.userId,

      departmentId: department.id,
      departmentName: department.name,

      title: title.trim(),
      category,

      description: description.trim(),
      location,

      attachments,

      attachments,

      // ===== AI & MAP =====
      coordinates: hasCoords ? { lat: latNum, lng: lngNum } : undefined,
      aiSummary: ai?.summary || '',
      duplicateOf: ai?.duplicate?.duplicate_of || null,
      // ===== END AI & MAP =====

      status: 'SUBMITTED',
      priority: ai?.priority || 'MEDIUM',

      history: [
        {
          status: 'SUBMITTED',
          note: 'Complaint submitted by citizen.',
        },
      ],
    })

    if (ai?.duplicate) {
      await Complaint.updateOne(
        { _id: ai.duplicate.duplicate_of },
        { $inc: { upvoteCount: 1 } }
      )
    }

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint,
    })
  } catch (error) {
    console.error(
      'Create complaint error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to submit complaint.',
    })
  }
}

export const getComplaints = async (req, res) => {
  try {
    const {
      province,
      district,
      municipality,
      ward,
      departmentId,
      category,
      status,
      priority,
    } = req.query

    const filter = {}

    // Citizens can only see their own complaints
    if (req.user.role === 'CITIZEN') {
      filter.userId = req.user.userId
    }

    // Staff can only see complaints from their department
    if (req.user.role === 'STAFF') {
      if (!req.user.departmentId) {
        return res.status(403).json({
          success: false,
          message:
            'Staff account is not assigned to a department.',
        })
      }

      filter.departmentId = req.user.departmentId
    }

    // Admin can see all complaints

    if (province) {
      filter['location.province'] = province
    }

    if (district) {
      filter['location.district'] = district
    }

    if (municipality) {
      filter['location.municipality'] = municipality
    }

    if (ward) {
      filter['location.ward'] = ward
    }

    if (departmentId) {
      filter.departmentId = departmentId
    }

    if (category) {
      filter.category = category
    }

    if (status) {
      filter.status = status
    }

    if (priority) {
      filter.priority = priority
    }

    const complaints = await Complaint.find(filter)
      .select('-userId -history')
      .sort({ createdAt: -1 })

    const total =
      await Complaint.countDocuments(filter)

    const statusCounts =
      await Complaint.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: '$status',
            count: {
              $sum: 1,
            },
          },
        },
      ])

    const statistics = {
      total: 0,
      submitted: 0,
      underReview: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      rejected: 0,
      reopened: 0,
    }

    statistics.total = total

    statusCounts.forEach((item) => {
      switch (item._id) {
        case 'SUBMITTED':
          statistics.submitted = item.count
          break

        case 'UNDER_REVIEW':
          statistics.underReview = item.count
          break

        case 'ASSIGNED':
          statistics.assigned = item.count
          break

        case 'IN_PROGRESS':
          statistics.inProgress = item.count
          break

        case 'RESOLVED':
          statistics.resolved = item.count
          break

        case 'CLOSED':
          statistics.closed = item.count
          break

        case 'REJECTED':
          statistics.rejected = item.count
          break

        case 'REOPENED':
          statistics.reopened = item.count
          break

        default:
          break
      }
    })

    return res.status(200).json({
      success: true,
      statistics,
      complaints,
    })
  } catch (error) {
    console.error(
      'Get complaints error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints.',
    })
  }
}

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(
      req.params.id
    )

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      })
    }

    // Citizen can only view their own complaint
    if (
      req.user.role === 'CITIZEN' &&
      complaint.userId?.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not authorized to view this complaint.',
      })
    }

    // Staff can only view complaints
    // belonging to their department
    if (
      req.user.role === 'STAFF' &&
      complaint.departmentId?.toString() !==
      req.user.departmentId?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not authorized to view this complaint.',
      })
    }

    // ADMIN can view any complaint

    return res.status(200).json({
      success: true,
      complaint,
    })
  } catch (error) {
    console.error(
      'Get complaint by ID error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint.',
    })
  }
}

export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params

    const {
      status,
      priority,
      note,
      resolution,
    } = req.body

    const allowedStatuses = [
      'SUBMITTED',
      'UNDER_REVIEW',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'CLOSED',
      'REJECTED',
      'REOPENED',
    ]

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.',
      })
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint status.',
      })
    }

    const allowedPriorities = [
      'LOW',
      'MEDIUM',
      'HIGH',
      'CRITICAL',
    ]

    if (!priority) {
      return res.status(400).json({
        success: false,
        message: 'Priority is required.',
      })
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint priority.',
      })
    }

    const complaint = await Complaint.findById(id)

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      })
    }

    const previousStatus = complaint.status

    complaint.status = status
    complaint.priority = priority

    if (resolution !== undefined) {
      complaint.resolution = resolution.trim()
    }

    if (
      status !== previousStatus ||
      (note && note.trim())
    ) {
      complaint.history.push({
        status,
        note:
          note && note.trim()
            ? note.trim()
            : `Complaint status changed from ${previousStatus} to ${status}.`,
        changedAt: new Date(),
      })
    }

    await complaint.save()

    return res.status(200).json({
      success: true,
      message: 'Complaint updated successfully.',
      complaint,
    })
  } catch (error) {
    console.error(
      'Update complaint error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint.',
    })
  }
}

export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params
    const { staffId } = req.body

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'Staff member is required.',
      })
    }

    const complaint =
      await Complaint.findById(id)

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      })
    }

    const staff = await User.findById(staffId)

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found.',
      })
    }

    if (staff.role !== 'STAFF') {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not a staff member.',
      })
    }

    if (!staff.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Selected staff member is inactive.',
      })
    }

    if (
      !staff.departmentId ||
      staff.departmentId.toString() !==
      complaint.departmentId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Staff member does not belong to the complaint department.',
      })
    }

    complaint.assignedTo = staff._id
    complaint.status = 'ASSIGNED'

    complaint.history.push({
      status: 'ASSIGNED',
      note: `Complaint assigned to ${staff.name}.`,
      changedAt: new Date(),
    })

    await complaint.save()

    return res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully.',
      complaint,
    })
  } catch (error) {
    console.error(
      'Assign complaint error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to assign complaint.',
    })
  }
}