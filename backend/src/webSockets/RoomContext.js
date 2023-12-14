import { ItemMetadata } from '#src/utils/ItemMetadata.js'

/**
 * RoomContext
 * @param {*} roomId - The unique ID of the room.
 * @returns
 */
function RoomContext(roomId) {
  const metadata = ItemMetadata(roomId)
  metadata.title = 'Room ' + roomId
  metadata.description = 'Description of room ' + roomId
  /****************************************
   *         PRIVATE VARIABLES            *
   ****************************************/

  /****************************************
   *         PRIVATE FUNCTIONS            *
   ****************************************/
  /****************************************
   *         PUBLIC FUNCTIONS             *
   ****************************************/
  const context = { ...metadata }

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  Object.defineProperty(context, 'roomId', {
    get: () => roomId,
    enumerable: true,
  })

  Object.defineProperty(context, 'engineController', {
    value: null,
    enumerable: true,
    writable: true,
  })

  Object.defineProperty(context, 'dataSender', {
    value: null,
    enumerable: true,
    writable: true,
  })

  return context
}

/****************************************
 *    FUNCTIONAL UTILITY FUNCTIONS      *
 ****************************************/

export { RoomContext }
