// TODO: check when changing limit, use object property instead of function for value and limit, add jsdoc for all functions
/**
 * Creates a counter object.
 * @function
 * @param {number} [initialValue=0] - The initial value of the counter.
 * @param {number} [limit=1] - The maximum value the counter can reach.
 * @returns {Object} The counter object.
 */
function Counter(initialValue = 0, initialLimit = 1) {
  /****************************************
   *         PRIVATE VARIABLES            *
   ****************************************/
  let _value = initialValue
  let _limit = initialLimit

  /****************************************
   *        PUBLIC FUNCTIONS              *
   ****************************************/
  const obj = {}
  obj.increment = () => (_value = increment(_value, _limit))
  obj.reset = () => (_value = 0)
  obj.setLimit = (newLimit) => (_limit = setLimit(newLimit))
  obj.getValue = () => _value
  obj.getLimit = () => _limit

  return obj
}

/****************************************
 *    FUNCTIONAL UTILITY FUNCTIONS      *
 ****************************************/

/**
 * Increments the counter value by one if it is less than the limit.
 * @function
 * @param {number} value - The current value of the counter.
 * @param {number} limit - The maximum value the counter can reach.
 * @returns {number} The incremented value of the counter.
 * @throws {Error} Throws an error if the counter value is equal to or exceeds the limit.
 */
const increment = (value, limit) => {
  if (value < limit) {
    return value + 1
  } else {
    throw new Error('Counter cannot exceed limit.')
  }
}

/**
 * Sets a new limit for the counter.
 * @function
 * @param {number} newLimit - The new maximum value the counter can reach.
 * @returns {number} The new limit of the counter.
 * @throws {Error} Throws an error if the new limit is negative.
 */
const setLimit = (newLimit) => {
  if (newLimit >= 0) {
    return newLimit
  } else {
    throw new Error('Limit cannot be negative.')
  }
}

export { Counter }
