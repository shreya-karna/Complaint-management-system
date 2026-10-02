import jwt from 'jsonwebtoken'

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication format.',
      })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    req.user = decoded

    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      })
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    })
  }
}