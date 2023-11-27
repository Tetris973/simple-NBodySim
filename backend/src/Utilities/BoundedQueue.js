/**
 * Creates a bounded queue with a flexible condition for removing elements.
 * @constructor
 * @param {number} boundValue - The value against which the computed value is compared to determine if the queue is over its bound.
 * @param {Function} computeBoundValue - Function that computes a value based on the queue's content.
 */
function BoundedQueue(boundValue, computeBoundValue) {
  /****************************************
   *         PRIVATE VARIABLES           *
   ****************************************/

  /**
   * The queue.
   * @type {Array}
   */
  let _queue = []

  /**
   * Default function to compute the bound value, based on the number of elements.
   * @param {*} queue
   * @returns
   */
  const _defaultComputeBoundValue = (queue) => queue.length

  // Use the provided function or the default
  const currentComputeBoundValue = computeBoundValue || _defaultComputeBoundValue

  /****************************************
   *         PUBLIC FUNCTIONS           *
   ****************************************/

  const obj = {}
  /**
   * Adds an element to the queue. Removes elements based on the bound value.
   * @param {*} element - The element to add.
   */
  obj.add = (element) => {
    _queue.unshift(element)
    while (_queue.length > 0 && currentComputeBoundValue([..._queue]) > boundValue) {
      _queue.pop() // Remove oldest element
    }
  }

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  /**
   * Getter for the queue.
   * @returns {Array} The queue.
   * @readonly
   */
  Object.defineProperty(obj, '_queue', {
    get: () => [..._queue],
  })

  /**
   * Getter for the bound value.
   * @returns {number} The bound value.
   * @readonly
   */
  Object.defineProperty(obj, 'boundValue', {
    value: boundValue,
    enumerable: true,
  })

  return obj
}

export { BoundedQueue }
