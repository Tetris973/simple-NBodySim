import geckos from '@geckos.io/server'

let geckosInstance = null

/**
 * Factory function to create or retrieve a singleton geckos.io server instance.
 * @param {Object} server The http server instance.
 * @param {Object[]} iceServers Array of ICE server configurations.
 * @returns The geckos.io server instance.
 */
function GeckosServer(server, iceServers = [{ urls: 'stun:stun.l.google.com:19302' }]) {
  if (!geckosInstance) {
    geckosInstance = geckos({ iceServers })
    geckosInstance.addServer(server)
  }
  return geckosInstance
}

export { GeckosServer }
