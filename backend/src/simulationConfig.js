import { Worker } from 'worker_threads'
import { SimpleEngineController } from '#src/engine/SimpleEngineController.js'
import { loadNBodyFromJSON } from '#src/services/nbodyLoader.js'
import { DataSender } from './webSockets/udpSockets/DataSender.js'
import { GeckosServer } from './webSockets/udpSockets/GeckosServer.js'
import { BoundedDeque } from './utils/BoundedDeque.js'
import { DEFAULT_ROOM_ID } from './webSockets/RoomManager.js'
import { setStopCallback } from './expressSimRoutes.js'
import ioc from 'socket.io-client'

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
  await control.setTimeScaleFactor(500000)
  //await control.setDt(1)
  await control.validate()
  return control
}

/**
 * Sets up the room, development/testing phase.
 * @param {*} roomMgr - RoomManager instance
 * @param {*} chanConnectMgr - ChannelConnectionManager instance
 * @param {*} sockConnectMgr - SocketConnectionManager instance
 * @param {*} sockChanMgr - SocketChannelManager instance
 */
async function setupRoom(roomMgr, chanConnectMgr, sockConnectMgr, sockChanMgr) {
  const sharedQueue = new BoundedDeque(10)
  roomMgr.create(DEFAULT_ROOM_ID)

  // get the roomContext to setup the engine
  const roomCtx = roomMgr.getRoomContext(DEFAULT_ROOM_ID)
  roomCtx.engineController = await setuptEngine(sharedQueue)

  roomCtx.dataSender = DataSender(GeckosServer(), DEFAULT_ROOM_ID, 16)
  roomCtx.dataSender.dataQueue = sharedQueue

  chanConnectMgr.onConnect((channelId) => {
    // create a client socket on the server side for test/dev purposes
    const clientSocket = ioc(`http://localhost:${3000}`)

    clientSocket.on('commandSuccess', (result) => {
      console.log('command result from Client', result)
    })
    clientSocket.on('commandError', (result) => {
      console.log('command error from Client', result)
    })
    setStopCallback(() => {
      clientSocket.emit('command', {
        category: 'engine',
        command: 'stop',
        data: {},
      })
    })
    sockConnectMgr.onConnect((socketId) => {
      sockChanMgr.associateIds(socketId, channelId)
      const ids = sockChanMgr.getIds(channelId)
      roomMgr.join(ids, DEFAULT_ROOM_ID)
      roomCtx.engineController.start()
    })
  })
  roomCtx.dataSender.startTransmission()
}

export { setupRoom }
