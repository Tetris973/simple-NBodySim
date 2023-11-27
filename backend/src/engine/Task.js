import { ItemMetadata } from '../Utilities/ItemMetadata.js'

/**
 * Represents a generic task in a system.
 * @function
 * @param {string} id - Unique identifier for the task.
 * @param {Function} computeFunction - The associated computation function.
 * @returns {Object} The task instance.
 */
function Task(id, computeFunction) {
  const metadata = ItemMetadata(id)

  /****************************************
   *          PUBLIC FUNCTIONS           *
   ****************************************/
  const obj = { ...metadata }

  /**
   * Processes the task with provided data.
   * @name Task#process
   * @param {...*} data - Data to process.
   * @returns {*} The result of computation function.
   */
  obj.process = (...data) => computeFunction(...data)

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  /**
   * Represents the associated computation function.
   * @name Task#computeFunction
   * @type {Function}
   * @readonly
   */
  Object.defineProperty(obj, 'computeFunction', {
    value: computeFunction,
    enumerable: true,
  })

  return obj
}

export { Task }
