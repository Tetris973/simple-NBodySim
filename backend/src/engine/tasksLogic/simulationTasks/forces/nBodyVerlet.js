/**
 * Calculates the next acceleration for a given n-body.
 *
 * @function calculNextAcc
 * @param {Object} body - The n-body for which to calculate acceleration.
 * @param {Array} nBodies - Array of all n-bodies in the simulation.
 */
function calculNextAcc(body, nBodies) {
  const G = 6.6743e-11 // Gravitational constant
  body.acc = { x: 0, y: 0 }

  nBodies.forEach((otherBody) => {
    if (otherBody === body) return

    let vectDirection = {
      x: body.pos.x - otherBody.pos.x,
      y: body.pos.y - otherBody.pos.y,
    }
    let distance = Math.sqrt(vectDirection.x ** 2 + vectDirection.y ** 2)

    let accMagnitude = (-G * otherBody.mass) / distance ** 3
    body.acc.x += vectDirection.x * accMagnitude
    body.acc.y += vectDirection.y * accMagnitude
  })
}

/**
 * Verlet integration for N-Body simulation.
 *
 * @function force
 * @param {Array} nBodies - Array of n-body entities to process.
 * @param {number} dt - Time delta for computation.
 */
function force(nBodies, dt) {
  // compute first every acceleration
  nBodies.forEach((body) => {
    calculNextAcc(body, nBodies)
  })

  // then update every position
  nBodies.forEach((body) => {
    // Save a copy of the current acceleration
    let accCopy = { ...body.acc }

    // Update position
    body.pos.x += body.vel.x * dt + (body.acc.x * dt * dt) / 2
    body.pos.y += body.vel.y * dt + (body.acc.y * dt * dt) / 2

    // Update velocity
    body.vel.x += ((accCopy.x + body.acc.x) * dt) / 2
    body.vel.y += ((accCopy.y + body.acc.y) * dt) / 2
  })
}

/**
 * Object representing the 'nBodyVerlet' compute function along with its metadata.
 * @type {Object}
 * @property {Function} function - The compute function.
 * @property {string} id - Unique identifier for the compute function.
 * @property {string} title - Human-readable title of the compute function.
 * @property {string} description - Description of what the compute function does.
 */
const nBodyVerlet = {
  function: force,
  id: 'nBodyVerlet',
  title: 'N-Body Verlet',
  description: 'N-Body simulation force using Verlet integration.',
}

export { nBodyVerlet }
