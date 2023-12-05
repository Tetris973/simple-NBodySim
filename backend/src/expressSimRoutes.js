import express from 'express'
import { ChannelRoomManager, DEFAULT_ROOM_ID } from './webSockets/udpSockets/ChannelRoomManager.js'

const router = express.Router()

router.post('/start', (req, res) => {
  try {
    const roomContext = ChannelRoomManager().getRoomContext(DEFAULT_ROOM_ID)
    if (!roomContext || !roomContext.engineController) {
      throw new Error('Room context or engine controller not found')
    }
    roomContext.engineController.start()
    res.send('Simulation started')
  } catch (error) {
    res.status(500).send(`Error starting simulation: ${error.message}`)
  }
})

router.post('/stop', (req, res) => {
  try {
    const roomContext = ChannelRoomManager().getRoomContext(DEFAULT_ROOM_ID)
    if (!roomContext || !roomContext.engineController) {
      throw new Error('Room context or engine controller not found')
    }
    roomContext.engineController.stop()
    res.send('Simulation stopped')
  } catch (error) {
    res.status(500).send(`Error stopping simulation: ${error.message}`)
  }
})

export { router as expressSimRoutes }
