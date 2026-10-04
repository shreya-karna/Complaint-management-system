import Notification from '../models/Notification.js'

export const getNotifications = async (
  req,
  res
) => {
  try {
    const notifications =
      await Notification.find({
        userId: req.user.userId,
      })
        .populate(
          'complaintId',
          'complaintNumber title status'
        )
        .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error(
      'Get notifications error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications.',
    })
  }
}

export const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      })
    }

    notification.isRead = true

    await notification.save()

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification,
    })
  } catch (error) {
    console.error(
      'Mark notification as read error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        'Failed to mark notification as read.',
    })
  }
}