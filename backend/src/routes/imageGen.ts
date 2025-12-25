import { Router } from 'express'

const router = Router()

const GEMINI_API_KEY = 'AIzaSyCRbNx-heVLcxYVCVl_XpMBX2LtTtEMcrc'
const GEMINI_MODEL = 'gemini-2.5-flash-image'

// Генерация изображения
router.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' })
        }

        console.log(`🎨 Generating image: ${prompt.substring(0, 50)}...`)

        // Используем x-goog-api-key в заголовке как в официальной документации
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        )

        const data = await response.json()

        if (!response.ok) {
            console.error('Gemini API error:', JSON.stringify(data, null, 2))
            return res.status(500).json({ error: 'Image generation failed', details: data })
        }

        // Ищем изображение в ответе
        const parts = data.candidates?.[0]?.content?.parts || []

        for (const part of parts) {
            if (part.inlineData) {
                console.log('✅ Image generated successfully')
                return res.json({
                    success: true,
                    image: {
                        data: part.inlineData.data,
                        mimeType: part.inlineData.mimeType
                    }
                })
            }
        }

        // Если изображения нет, возвращаем текст
        const textPart = parts.find((p: any) => p.text)
        return res.json({
            success: false,
            message: textPart?.text || 'No image generated',
            rawResponse: data
        })

    } catch (error) {
        console.error('Image generation error:', error)
        res.status(500).json({ error: 'Internal server error', details: String(error) })
    }
})

// Генерация иконки категории
router.post('/category-icon', async (req, res) => {
    try {
        const { categoryName, style } = req.body

        const prompt = `Create a simple, minimalist icon for "${categoryName}" category. 
Style: ${style || 'neon cyberpunk'}. 
Requirements: 
- Single icon, centered
- Transparent or dark background (#0a0a0a)
- Glowing effect
- Size: 128x128 pixels
- No text, only symbol`

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
                })
            }
        )

        const data = await response.json()
        const parts = data.candidates?.[0]?.content?.parts || []

        for (const part of parts) {
            if (part.inlineData) {
                return res.json({
                    success: true,
                    image: part.inlineData
                })
            }
        }

        res.json({ success: false, message: 'No icon generated' })

    } catch (error) {
        console.error('Icon generation error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Генерация фона для темы
router.post('/theme-background', async (req, res) => {
    try {
        const { themeName, description } = req.body

        const prompt = `Create an abstract background pattern for a mobile app theme called "${themeName}".
Description: ${description}
Requirements:
- Abstract, seamless pattern
- Dark base color
- Subtle, not distracting
- Size: 1080x1920 pixels (mobile)
- No text or logos`

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
                })
            }
        )

        const data = await response.json()
        const parts = data.candidates?.[0]?.content?.parts || []

        for (const part of parts) {
            if (part.inlineData) {
                return res.json({
                    success: true,
                    image: part.inlineData
                })
            }
        }

        res.json({ success: false, message: 'No background generated' })

    } catch (error) {
        console.error('Background generation error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
