import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { loadNBodyFromJSON } from './src/services/NbodyLoader.js'

const app = express()
// Serve static files from the React app, the index.html file
app.use(express.static('dist'))
// Enable CORS, Cross-Origin Resource Sharing from all origins
app.use(cors())
// Enable environment variables
dotenv.config()

// Routes
app.get('/info', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

// Start server
const port = process.env.PORT
app.listen(port, () => {
  console.log('Server listening on port', port)
})

const planets = await loadNBodyFromJSON('./src/data/planetsConfig.json')
console.log(planets)
