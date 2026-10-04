const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

async function post(path, body) {
    try {
        const res = await fetch(`${AI_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(20000),   // first call is slow while models warm up
        })
        if (!res.ok) throw new Error(`AI service responded ${res.status}`)
        return await res.json()
    } catch (err) {
        console.warn(`[AI] ${path} failed:`, err.message)
        return null                              // null means "continue without AI"
    }
}

export const aiCategorize = (text, categories) => post('/categorize', { text, categories })
export const aiAnalyze = (payload) => post('/analyze', payload)