/**
 * Processes command responses to determine the appropriate event name, message,
 * and the recipient for socket.io communication.
 *
 * @returns {Function} A function that takes a command response and returns an object
 *                     containing the event name, message, and recipient.
 */
const ResponseProcessor = () => {
  /**
   * Processes a command response to determine the appropriate event name, message,
   * and the recipient for socket.io communication.
   *
   * @param {Object} commandResponse - The response to a command execution.
   * @param {string} commandResponse.action - The action or command that was executed.
   * @param {string} commandResponse.status - The status of the command execution, typically 'success' or 'error'.
   * @param {*} [commandResponse.data] - Additional data related to the command response. This is optional and can be any type, depending on the command.
   * @returns {Object} An object containing the event name, message, and recipient.
   *                  The object has the following structure:
   * @param {string} eventName - The name of the event to emit.
   * @param {Object} message - The message to send.
   * @param {string} to - The recipient of the message, either 'room' or 'sender'.
   */
  return ({ action, status, data }) => {
    // Stop implementation, more general implementation will be done later
    if (
      action !== 'stop' &&
      action !== 'start' &&
      action !== 'restart' &&
      action !== 'setDt' &&
      action !== 'setTimeScale' &&
      action !== 'getInfos'
    ) {
      throw new Error(`Unsupported action: ${action}`)
    }

    // determine the event name
    let eventName = 'commandSuccess'
    if (status === 'error') {
      eventName = 'commandError'
    }

    // determine who to send the message to
    let to = 'room'
    if (status === 'error') {
      to = 'sender'
    }

    // determine the message
    // for the moment i don't know and stop does not return anything
    let message = {
      action,
      data,
    }

    return { eventName, message, to }
  }
}

export { ResponseProcessor }
