/**
 * Creates a bounded queue with a flexible condition for removing items.
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
  let _items = []

  /**
   * Default function to compute the bound value, based on the number of items.
   * @param {*} items
   * @returns
   */
  const _defaultComputeBoundValue = (items) => items.length

  // Use the provided function or the default
  const currentComputeBoundValue = computeBoundValue || _defaultComputeBoundValue

  /****************************************
   *         PUBLIC FUNCTIONS           *
   ****************************************/

  const obj = {}
  /**
   * Enqueues an item to the queue and removes items if the bound is exceeded.
   * @param {*} item - The item to add.
   */
  obj.enqueue = (item) => {
    _items.push(item) // Add to the end
    while (currentComputeBoundValue([..._items]) > boundValue) {
      _items.shift() // Remove from the beginning if bound exceeded
    }
  }

  /**
   * Dequeues and returns the oldest item from the queue.
   * @returns {*} The dequeued item.
   */
  obj.dequeue = () => {
    if (_items.length === 0) {
      throw new Error('Queue is empty')
    }
    return _items.shift()
  }

  /**
   * Returns the item at the front of the queue without removing it.
   * Returns null if the queue is empty.
   * @returns {*} The front item or null if the queue is empty.
   */
  obj.peek = () => {
    return _items.length === 0 ? null : _items[0]
  }

  /**
   * Returns the last (newest) element in the queue without removing it.
   * Returns null if the queue is empty.
   * @returns {*} The last element or null if the queue is empty.
   */
  obj.last = () => {
    return _items.length === 0 ? null : _items[_items.length - 1]
  }

  /**
   * Checks if the queue is empty.
   * @returns {boolean} True if the queue is empty, false otherwise.
   */
  obj.isEmpty = () => {
    return _items.length === 0
  }

  /**
   * Clears all items from the queue.
   */
  obj.clear = () => {
    _items = []
  }

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  /**
   * Getter for the queue.
   * @returns {Array} The queue.
   * @readonly
   */
  Object.defineProperty(obj, 'items', {
    get: () => [..._items],
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

  /**
   * Getter for the length of the queue.
   * @returns {number} The number of items in the queue.
   * @readonly
   */
  Object.defineProperty(obj, 'length', {
    get: () => _items.length,
    enumerable: true,
  })

  return obj
}

export { BoundedQueue }
