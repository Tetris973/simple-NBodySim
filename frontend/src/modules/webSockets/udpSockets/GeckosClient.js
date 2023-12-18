import geckos from '@geckos.io/client'

let geckosInstance = null

/**
 * Factory function to create or retrieve a singleton geckos.io client instance.
 * @returns The geckos.io client instance.
 */
const GeckosClient = () => {
  const options = {
    port: window.location.hostname === 'localhost' ? 3000 : null,
  }

  if (!geckosInstance) {
    geckosInstance = geckos(options)
  }

  return geckos(options)
}

export { GeckosClient }
