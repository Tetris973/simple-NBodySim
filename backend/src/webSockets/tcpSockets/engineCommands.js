import { loadNBodyFromJSON } from '#src/services/nbodyLoader.js'

/**
 * @typedef {Object} CommandResponse
 * @property {string} action - The action or command that was executed.
 * @property {string} status - The status of the command execution, typically 'success' or 'error'.
 * @property {*} [data] - Additional data related to the command response. This is optional and can be any type, depending on the command.
 * @property {string} [error] - An error message, present if the status is 'error'. This is optional.
 */

const engineCommands = {
  /**
   * Stops the engine and returns the result of the operation.
   *
   * @param {Object} context - The context for the command, including the room context.
   * @returns {Promise<CommandResponse>} A promise that resolves to a CommandResponse object indicating the outcome.
   */
  stop: (context) => {
    if (!context.roomContext) {
      return Promise.reject(new Error('Missing roomContext in context for "stop" command'))
    }
    return context.roomContext.engineController
      .stop()
      .then((data) => ({ action: 'stop', status: 'success', data }))
      .catch((error) => ({ action: 'stop', status: 'error', error: error.message }))
  },
  start: (context) => {
    if (!context.roomContext) {
      return Promise.reject(new Error('Missing roomContext in context for "start" command'))
    }
    return context.roomContext.engineController
      .start()
      .then((data) => ({ action: 'start', status: 'success', data }))
      .catch((error) => ({ action: 'start', status: 'error', error: error.message }))
  },
  restart: async (context) => {
    if (!context.roomContext) {
      return Promise.reject(new Error('Missing roomContext in context for "restart" command'))
    }
    const engineController = context.roomContext.engineController
    const entities = await loadNBodyFromJSON('./data/planetsConfig.json')
    const result = engineController.setEntities(entities)
    return result
      .then((data) => ({ action: 'restart', status: 'success', data }))
      .catch((error) => ({ action: 'restart', status: 'error', error: error.message }))
  },
  setDt: async (context) => {
    if (!context.roomContext) {
      return Promise.reject(new Error('Missing roomContext in context for "setDt" command'))
    }
    const dt = context.data
    const data = { dt }

    return context.roomContext.engineController
      .setDt(context.data)
      .then(() => ({ action: 'setDt', status: 'success', data }))
      .catch((error) => ({ action: 'setDt', status: 'error', error: error.message }))
  },
  setTimeScale: async (context) => {
    if (!context.roomContext) {
      return Promise.reject(new Error('Missing roomContext in context for "setTimeScale" command'))
    }
    if (context.data < 1) {
      return Promise.reject(new Error('Time scale factor must be positive'))
    }
    const timeScale = context.data
    const data = { timeScale }

    return context.roomContext.engineController
      .setTimeScaleFactor(context.data)
      .then(() => ({ action: 'setTimeScale', status: 'success', data }))
      .catch((error) => ({ action: 'setTimeScale', status: 'error', error: error.message }))
  },
  getInfos: async (context) => {
    if (!context.roomContext) {
      return Promise.reject(new Error('Missing roomContext in context for "getInfos" command'))
    }
    return context.roomContext.engineController
      .getEngineInfos()
      .then((data) => ({ action: 'getInfos', status: 'success', data }))
      .catch((error) => ({ action: 'getInfos', status: 'error', error: error.message }))
  },

  // Other commands...
}

// import { loadNBodyFromJSON } from '#src/services/nbodyLoader.js'
// router.post('/restart', async (req, res) => {
//   try {
//     roomContext.engineController.stop()
//     const entities = await loadNBodyFromJSON('./data/planetsConfig.json')
//     await roomContext.engineController.setEntities(entities)
//     roomContext.engineController.start()
//     res.send('Simulation restarted')
//   } catch (error) {
//     res.status(500).send(`Error restarting simulation: ${error.message}`)
//   }
// })

export { engineCommands }
