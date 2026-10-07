import express from 'express'
import multer from 'multer'
import Category from '../models/Category.js'
import { aiCategorize, aiCategorizeImage } from '../services/aiService.js'
import { authenticate } from '../middleware/authMiddleware.js'
const router = express.Router()

const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
        cb(ok ? null : new Error('Only JPG, PNG or WEBP images can be analysed.'), ok)
    },
}).single('image')

const handleImageUpload = (req, res, next) =>
    imageUpload(req, res, (err) =>
        err ? res.status(400).json({ message: err.message }) : next()
    )

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

router.post(
    '/suggest-category-from-image',
    authenticate,
    handleImageUpload,
    async (req, res) => {
        try {
            const { departmentId } = req.body
            const text = req.body.text || ''

            if (!departmentId || !req.file) {
                return res
                    .status(400)
                    .json({ message: 'departmentId and image are required' })
            }

            const categories = await Category.find({
                departmentId,
                isActive: true,
            }).lean()

            const result = await aiCategorizeImage({
                image_base64: req.file.buffer.toString('base64'),
                mime_type: req.file.mimetype,
                text,
                categories: categories.map((c) => ({
                    id: String(c._id),
                    name: c.name,
                    description: c.description || '',
                })),
            })

            if (!result) {
                return res.status(503).json({ message: 'AI service unavailable' })
            }

            res.json(result)
        } catch (error) {
            console.error('suggest-category-from-image error:', error)
            res.status(500).json({ message: 'Failed to analyse image' })
        }
    }
)

export default router