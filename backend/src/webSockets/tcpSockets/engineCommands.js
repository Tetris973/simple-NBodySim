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
  // Other commands...
}

export { engineCommands }
