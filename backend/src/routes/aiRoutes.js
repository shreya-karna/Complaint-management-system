import express from 'express'
import Category from '../models/Category.js'
import { aiCategorize } from '../services/aiService.js'

const router = express.Router()

router.post('/suggest-category', async (req, res) => {
    const { departmentId, text } = req.body

    if (!departmentId || !text) {
        return res
            .status(400)
            .json({ message: 'departmentId and text are required' })
    }

    const categories = await Category.find({
        departmentId,
        isActive: true,
    }).lean()

    const result = await aiCategorize(
        text,
        categories.map((c) => ({
            id: String(c._id),
            name: c.name,
            description: c.description || '',
        }))
    )

    if (!result) {
        return res.status(503).json({ message: 'AI service unavailable' })
    }

    res.json(result)
})

export default router