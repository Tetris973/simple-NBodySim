import { io } from 'socket.io-client'

let socketInstance = null

const SocketClient = () => {
  if (!socketInstance) {
    socketInstance = io({ autoConnect: false })
  }
  return socketInstance
}

export { SocketClient }
