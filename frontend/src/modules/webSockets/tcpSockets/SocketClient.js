import { io } from 'socket.io-client'

let socketInstance = null

const SocketClient = () => {
  if (!socketInstance) {
    socketInstance = io(`http://localhost:${3000}`, { autoConnect: false })
  }
  return socketInstance
}

export { SocketClient }
