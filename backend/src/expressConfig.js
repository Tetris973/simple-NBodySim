// expressConfig.js
import express from 'express'
import { expressSimRoutes } from './expressSimRoutes.js'
import cors from 'cors'

function setupExpressApp() {
  const app = express()
  app.use(express.static('dist'))
  app.use(express.json())
  app.use(cors())
  app.use('/simulation', expressSimRoutes)
  return app
}

export { setupExpressApp }
