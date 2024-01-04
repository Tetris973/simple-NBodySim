import { Worker } from 'worker_threads'
import { SimpleEngineController } from '#src/engine/SimpleEngineController.js'
import { loadNBodyFromJSON } from '#src/services/nbodyLoader.js'
import { DataSender } from './webSockets/udpSockets/DataSender.js'
import { GeckosServer } from './webSockets/udpSockets/GeckosServer.js'
import { BoundedDeque } from './utils/BoundedDeque.js'
import { DEFAULT_ROOM_ID } from './webSockets/RoomManager.js'

async function setuptEngine(sharedQueue) {
  const worker = new Worker('./src/engine/SimpleEngineWorker.js')
  const control = await SimpleEngineController(worker)
  const entities = await loadNBodyFromJSON('./data/planetsConfig.json')

  control.onEngineData((data) => {
    sharedQueue.pushFront(data)
  })

  await control.init()
  await control.getEngineInfos()
  await control.setEntities(entities)
  await control.setTask('nBodyVerlet')
  await control.setTimeScaleFactor(2000000)
  //await control.setDt(1)
  await control.validate()
  return control
}

/**
 * Sets up the room, development/testing phase.
 * @param {*} roomMgr - RoomManager instance
 */
async function setupRoom(roomMgr) {
  const sharedQueue = new BoundedDeque(10)
  roomMgr.create(DEFAULT_ROOM_ID)

  // get the roomContext to setup the engine
  const roomCtx = roomMgr.getRoomContext(DEFAULT_ROOM_ID)
  roomCtx.engineController = await setuptEngine(sharedQueue)

  roomCtx.dataSender = DataSender(GeckosServer(), DEFAULT_ROOM_ID, 16)
  roomCtx.dataSender.dataQueue = sharedQueue
  roomCtx.dataSender.startTransmission()
  roomCtx.engineController.start()
}

export { setupRoom }
