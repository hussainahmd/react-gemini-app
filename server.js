const PORT = 8000
import express from 'express'
import cors from 'cors'
const app = express()
app.use(cors())
app.use(express.json())
import { configDotenv } from 'dotenv'
import fs from 'fs'
import multer from 'multer'
import { GoogleGenerativeAI } from '@google/generative-ai'

configDotenv()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

let base64String
const storage = multer.memoryStorage()
const upload = multer({ storage: storage }).single('file')

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err)
            return res.send(500).json(err)

        const file = req.file

        if (!file) {
            return res.status(400).send('No file uploaded.')
        }

        base64String = file.buffer.toString('base64');
    })
})

app.post('/gemini', async (req, res) => {
    try {
        const { message } = req.body
        console.log(message,'\n')

        const fileToGenerativePart = (imgBase64, mimeType) => ({
            inlineData: {
                data: imgBase64,
                mimeType,
            },
        })

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const result = await model.generateContent([
            message,
            fileToGenerativePart(base64String, 'image/jpeg'),
        ])
        const text = result.response.text()

        res.status(200).send(text)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to generate content', details: err.message })
    }
});

app.listen(PORT, () => console.log('Listening to changes on PORT :', PORT))