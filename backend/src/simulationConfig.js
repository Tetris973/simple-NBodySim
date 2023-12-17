import { Worker } from 'worker_threads'
import { SimpleEngineController } from '#src/engine/SimpleEngineController.js'
import { loadNBodyFromJSON } from '#src/services/nbodyLoader.js'
import { ChannelRoomManager, DEFAULT_ROOM_ID } from './webSockets/udpSockets/ChannelRoomManager.js'
import { DataSender } from './webSockets/udpSockets/DataSender.js'
import { GeckosServer } from './webSockets/udpSockets/GeckosServer.js'
import { BoundedDeque } from './utils/BoundedDeque.js'

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
  await control.setTimeScaleFactor(200000)
  //await control.setDt(1)
  await control.validate()
  return control
}

async function setupRoom() {
  const sharedQueue = new BoundedDeque(10)
  const channelRoomManager = ChannelRoomManager()
  channelRoomManager.createRoom(DEFAULT_ROOM_ID)
  const roomContext = channelRoomManager.getRoomContext(DEFAULT_ROOM_ID)
  roomContext.engineController = await setuptEngine(sharedQueue)

  roomContext.dataSender = DataSender(GeckosServer(), DEFAULT_ROOM_ID, 16)
  roomContext.dataSender.dataQueue = sharedQueue
  channelRoomManager.onConnect((channelId) => {
    channelRoomManager.joinRoom(channelId, DEFAULT_ROOM_ID)
    roomContext.engineController.start()
  })
  roomContext.dataSender.startTransmission()
  channelRoomManager.joinRoom('channelId', 'roomId')
}

export { setupRoom }
