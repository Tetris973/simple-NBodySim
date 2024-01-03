const DataSender = (geckosInstance, roomId, sendRate) => {
  if (!geckosInstance) throw new Error('Geckos.io server is needed')

  /****************************************
   *         PRIVATE VARIABLES            *
   ****************************************/
  /**
   * The interval used to transmit data to the room.
   */
  let _transmissionInterval = null
  let _roomId = roomId
  let _sendRate = sendRate

  /****************************************
   *         PRIVATE FUNCTIONS            *
   ****************************************/

  /****************************************
   *         PUBLIC FUNCTIONS             *
   ****************************************/
  const sender = {}

  sender.startTransmission = () => {
    if (_transmissionInterval) clearInterval(_transmissionInterval)

    _transmissionInterval = setInterval(() => {
      if (!sender.dataQueue) throw new Error('Data queue is needed')
      if (sender.dataQueue.empty()) return
      const data = sender.dataQueue.popBack()
      const positions = data.map((planet) => {
        return { [planet.id]: planet.pos }
      })
      sendDataToRoom(geckosInstance, _roomId, positions)
    }, _sendRate)
  }

  sender.stopTransmission = () => {
    if (_transmissionInterval) {
      clearInterval(_transmissionInterval)
      _transmissionInterval = null
    }
  }

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  /**
   * Get the current transmission status of the sender.
   * @name DataSender#isTransmitting
   * @type {boolean}
   * @readonly
   */
  Object.defineProperty(sender, 'isTransmitting', {
    get: () => {
      return _transmissionInterval ? true : false
    },
  })

  /**
   * The current transmission rate of the sender.
   * @name DataSender#sendRate
   * @type {number}
   * @description
   * The transmission rate is the number of milliseconds between each transmission.
   */
  Object.defineProperty(sender, 'sendRate', {
    get: () => {
      return _sendRate
    },
    set: (value) => {
      _sendRate = value
      sender.stopTransmission()
      sender.startTransmission()
    },
  })

  /**
   * The data queue that the sender uses to retrieve data to send.
   * @name DataSender#dataQueue
   * @property {BoundedDeque}
   * @description
   * The data queue is a bounded queue that is shared between the sender and the receiver.
   */
  Object.defineProperty(sender, 'dataQueue', {
    value: null,
    writable: true,
    enumerable: true,
  })

  return sender
}

/****************************************
 *    FUNCTIONAL UTILITY FUNCTIONS      *
 ****************************************/

const sendDataToRoom = (geckosInstance, roomId, data) => {
  if (data) {
    geckosInstance.room(roomId).emit('simulationData', data)
  }
}

export { DataSender }
