function sleep(ms) {
  let now = Date.now()
  while (Date.now() - now < ms) {
    // do nothing
  }
}

/**
 * A force that adds dt to each property of the n-body entities.
 * @function force
 * @param {Array} nBodies - Array of n-body entities to process.
 * @param {number} dt - Time delta for computation.
 */
function force(nBodies, dt) {
  sleep(10)
  nBodies.forEach((body) => {
    for (const property in body) {
      if (typeof body[property] === 'number') {
        body[property] += dt
      }
    }
  })

  return nBodies
}

/**
 * Object representing the 'exampleTask' compute function along with its metadata.
 * @type {Object}
 * @property {Function} function - The compute function.
 * @property {string} id - Unique identifier for the compute function.
 * @property {string} title - Human-readable title of the compute function.
 * @property {string} description - Description of what the compute function does.
 */
const exampleTask = {
  function: force,
  id: 'exampleTask',
  title: 'Example Task',
  description: 'Adds dt to each numerical property of the n-body entities.',
}

export { exampleTask }
