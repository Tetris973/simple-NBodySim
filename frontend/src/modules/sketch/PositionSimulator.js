/**
 * Creates a PositionSimulator object.
 * @returns {PositionSimulator} The created PositionSimulator object.
 */
function PositionSimulator() {
  const obj = Object.create(PositionSimulator.prototype)
  obj.planets = {} // To store callbacks for each planet
  obj.positionsData = {} // To store loaded positions for each planet
  return obj
}

/**
 * Registers a planet's setPosition callback.
 * @param {string} name - The name of the planet.
 * @param {Function} setPositionCallback - The callback function to set the position of the planet.
 */
PositionSimulator.prototype.registerPlanet = function (name, setPositionCallback) {
  this.planets[name] = setPositionCallback
}

/**
 * Sets the loaded positions data for a planet.
 * @param {string} planetName - The name of the planet.
 * @param {Object[]} positions - The array of position data for the planet.
 */
PositionSimulator.prototype.setPositionsData = function (planetName, positions) {
  this.positionsData[planetName] = positions
}

import geckos from '@geckos.io/client'
// Create a channel to connect to the server

const channel = geckos({
  port: window.location.hostname === 'localhost' ? 3000 : null,
})

/**
 * Starts the loop that updates positions.
 * @param {number} timesPerSecond - The number of times the positions should be updated per second.
 */
PositionSimulator.prototype.startLoop = function () {
  channel.onConnect((error) => {
    if (error) {
      console.error(error.message)
      return
    }

    // Log on successful connection
    console.log('You are connected to the server!')

    // Listening for messages from the server
    channel.on('simulationData', (data) => {
      data.map((obj) => {
        const id = Object.keys(obj)[0] // Get the id (planet name)
        const pos = obj[id] // Get the position object
        this.planets[id](pos.x, pos.y)
      })
    })
  })
}

export default PositionSimulator

// Separate function to load positions data
/**
 * Loads positions data for a planet.
 * @param {string} planetName - The name of the planet.
 * @returns {Promise<Object[]>} A promise that resolves with the positions data for the planet.
 */
export async function loadPositionsData(planetName) {
  try {
    const positions = await import(`./data/${planetName}_positions.json`)
    return positions.default
  } catch (error) {
    console.error(`Failed to load positions data for ${planetName}:`, error)
    throw error
  }
}
