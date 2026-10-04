import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import connectDatabase from './config/database.js'
import complaintRoutes from './routes/complaintRoutes.js'
import departmentRoutes from './routes/departmentRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import userRoutes from './routes/userRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'

dotenv.config()

const app = express()

app.use(
cors({
origin: process.env.FRONTEND_URL,
})
)

app.use(express.json())

app.use(
'/uploads',
express.static('uploads')
)

app.get('/api/health', (req, res) => {
res.json({
success: true,
message:
'Complaint Management API is running.',
})
})

app.use(
'/api/complaints',
complaintRoutes
)

app.use(
  '/api/notifications',
  notificationRoutes
)

app.use(
  '/api/departments',
  departmentRoutes
)

app.use(
  '/api/categories',
  categoryRoutes
)

app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 5000

const startServer = async () => {
await connectDatabase()

app.listen(PORT, () => {
console.log(
`Server running on http://localhost:${PORT}`
)
})
}

startServer()
