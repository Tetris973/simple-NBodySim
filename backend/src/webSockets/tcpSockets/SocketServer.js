import { Server } from 'socket.io'

function SocketServer(httpServer) {
  const options = {}
  const io = new Server(httpServer, options)

  return io
}

export { SocketServer }
