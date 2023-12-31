import express from 'express'
import { RoomManager } from './webSockets/RoomManager.js'
import { DEFAULT_ROOM_ID } from './webSockets/RoomManager.js'

const router = express.Router()
let stopCallback
let setStopCallback = (callback) => {
  stopCallback = callback
}

const getRoomContext = () => {
  const roomContext = RoomManager().getRoomContext(DEFAULT_ROOM_ID)
  if (!roomContext || !roomContext.engineController) {
    throw new Error('Room context or engine controller not found')
  }
  return roomContext
}

router.post('/start', (req, res) => {
  try {
    const roomContext = getRoomContext()
    roomContext.engineController.start()
    res.send('Simulation started')
  } catch (error) {
    res.status(500).send(`Error starting simulation: ${error.message}`)
  }
})

router.post('/stop', (req, res) => {
  // try to call stopCallback, if it does not work then continue with the default behavior
  if (stopCallback) {
    try {
      stopCallback()
      res.send('Simulatio stop command sent with socket.io')
      return
    } catch (error) {
      res.status(500).send(`Error stopping simulation with socket.io: ${error.message}`)
      return
    }
  }
  // try {
  //   const roomContext = getRoomContext()
  //   roomContext.engineController.stop()
  //   res.send('Simulation stopped')
  // } catch (error) {
  //   res.status(500).send(`Error stopping simulation: ${error.message}`)
  // }
})

import { loadNBodyFromJSON } from '#src/services/nbodyLoader.js'
router.post('/restart', async (req, res) => {
  try {
    const roomContext = getRoomContext()
    roomContext.engineController.stop()
    const entities = await loadNBodyFromJSON('./data/planetsConfig.json')
    await roomContext.engineController.setEntities(entities)
    roomContext.engineController.start()
    res.send('Simulation restarted')
  } catch (error) {
    res.status(500).send(`Error restarting simulation: ${error.message}`)
  }
})

router.post('/setTimeScaleFactor', (req, res) => {
  try {
    const roomContext = getRoomContext()
    const { timeScaleFactor } = req.body
    roomContext.engineController.setTimeScaleFactor(timeScaleFactor)
    res.send(`Time scale factor set to ${timeScaleFactor}`)
  } catch (error) {
    res.status(500).send(`Error setting time scale factor: ${error.message}`)
  }
})

router.post('/setDt', (req, res) => {
  try {
    const roomContext = getRoomContext()
    const { dt } = req.body
    roomContext.engineController.setDt(dt)
    res.send(`Delta time set to ${dt} seconds`)
  } catch (error) {
    res.status(500).send(`Error setting delta time: ${error.message}`)
  }
})

export { router as expressSimRoutes, setStopCallback }
