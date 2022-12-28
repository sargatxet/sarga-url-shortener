'use strict'

// Libraries
import { customAlphabet } from 'nanoid'
import fs from 'fs'

// Environment
const PORT = process.env.PORT || 3000
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Init
import express from 'express'
const app = express()

// NanoId with custom alphabet
const newId = (len) => {
  const nanoid = customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    len || 12
  )
  return nanoid()
}

// Middlewares
app.use(express.json())

// Config static content
app.use('/', express.static(path.join(__dirname, 'public')))

// Endpoints

// New URL
app.post('/form', (req, res, next) => {
  // Get form data
  const { url } = req.body

  if (!url) {
    console.error(new Date(), '[POST]', 'No URL provided')
    return res.status(400).json({ error: 'No URL provided' })
  }

  // Create dir if does not exists
  const fileDir = path.join(__dirname, 'tmp')
  if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true })

  // Get new file to save URL
  let fileName = null
  let id = null
  do {
    id = newId()
    fileName = path.join(fileDir, `${id}.json`)
  } while (fs.existsSync(fileName))

  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + 30)
  fs.writeFileSync(
    fileName,
    JSON.stringify({
      url,
      expirationDate
    })
  )

  console.log(new Date(), '[POST]', `New URL: ${BASE_URL}/${id}`)
  res.status(200).json({ shortURL: `${BASE_URL}/${id}` })
})

// Existing URL
app.get('/:id', (req, res, next) => {
  // Get URL id
  const { id } = req.params
  if (!id) return next()

  // Search file
  const fileName = path.join(__dirname, 'tmp', `${id}.json`)
  if (!fs.existsSync(fileName)) return res.redirect('/index.html')

  // Load file
  let urlData = JSON.parse(fs.readFileSync(fileName))
  if (new Date(urlData.expirationDate) < new Date()) {
    console.error(new Date(), '[GET]', `URL ${id} expired`)
    urlData = JSON.parse(fs.readFileSync('./defaultRoute.json'))
  }

  res.redirect(urlData.url)
})

// Default route
app.get('*', (req, res, next) => {
  res.redirect('/index.html')
})

// Launch
app.listen(PORT, (error) => {
  if (!error) console.log(new Date(), '[RUN]', `Server running on port ${PORT}`)
  else console.error(new Date(), '[RUN]', 'Cannot start server', error)
})
