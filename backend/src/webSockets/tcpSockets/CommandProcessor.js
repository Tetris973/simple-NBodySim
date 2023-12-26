import { engineCommands } from './engineCommands.js'

const COMMAND_SETS = {
  engine: engineCommands,
}

/**
 * Creates a command processing function with access to roomManager and a set of command definitions.
 *
 * @param {Object} roomManager - The manager responsible for handling room contexts.
 * @param {Object} commandSets - An object containing sets of command functions categorized by their types.
 * @returns {Function} A function that processes commands based on the provided category, command name, userIds, and additional data.
 */
const CommandProcessor = (roomManager, commandSets) => {
  /**
   * Processes a command based on its category and name.
   *
   * @param {string} category - The category of the command to execute.
   * @param {string} command - The name of the command to execute.
   * @param {Object} userIds - An object containing user-related IDs.
   * @param {Object} data - Additional data required for the command execution.
   * @returns {Promise<Object>} A promise that resolves to an object containing the outcome of the command execution.
   *                             The resolved object has the following structure:
   *                             { action: string, status: 'success' | 'error', data?: any, error?: string }
   */
  return (category, command, userIds, data) => {
    let context = { data, roomContext: roomManager.getRoomContextByUserId(userIds.userId) }
    let commandSet = commandSets[category]

    if (commandSet && commandSet[command]) {
      return Promise.resolve()
        .then(() => commandSet[command](context))
        .catch((error) => ({
          action: command,
          status: 'error',
          error: `unchaught error : ${error.message}`,
        }))
    } else {
      return Promise.resolve({
        action: commandSet ? command : category,
        status: 'error',
        error: commandSet ? 'Invalid command' : 'Invalid command category',
      })
    }
  }
}

export { CommandProcessor, COMMAND_SETS }
