import Complaint from '../models/Complaint.js'
import { aiAnalyze } from './aiService.js'

const WINDOW_DAYS = 14

export async function analyzeNewComplaint({
    text,
    category,
    departmentId,
    lat,
    lng,
    address,
}) {
    const since = new Date(Date.now() - WINDOW_DAYS * 86400000)

    // Candidates come from MongoDB: same department, same category, still open, recent
    const found = await Complaint.find({
        departmentId,                     // String in your model
        category,                         // category NAME (String) in your model
        status: { $nin: ['CLOSED', 'RESOLVED', 'REJECTED'] },
        createdAt: { $gte: since },
    })
        .limit(100)
        .lean()

    const candidates = found.map((c) => ({
        id: String(c._id),
        text: c.description || '',
        lat: c.coordinates?.lat ?? null,
        lng: c.coordinates?.lng ?? null,
        upvotes: c.upvoteCount || 0,
    }))

    return aiAnalyze({
        text,
        category,
        lat,
        lng,
        address: address || '',
        candidates,
    })
}