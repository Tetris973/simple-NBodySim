import NBody from '../models/NBody.js'
import fs from 'fs/promises'

/**
 * Load an array of NBody objects from a JSON file.
 * @param {string} jsonPath - The path to the JSON file.
 * @returns {Promise<NBody[]>} A promise that resolves to an array of NBody objects.
 */
export async function loadNBodyFromJSON(jsonPath) {
  const planetsData = await loadAndCheckPlanetsJSON(jsonPath)

  return planetsData.map((planetData) => {
    const nbody = NBody(0, 0, 0, 0, 'default')

    nbody.mass = planetData.mass
    nbody.position = {
      x: planetData.initialX,
      y: planetData.initialY,
    }
    nbody.velocity = {
      x: planetData.initialVelocityX,
      y: planetData.initialVelocityY,
    }
    nbody.name = planetData.name

    return nbody
  })
}

/**
 * Validates the structure of the provided JSON data for a planet.
 *
 * @param {Object} planet - The planet data to validate.
 * @returns {boolean} - Returns true if the structure is valid, false otherwise.
 */
function validatePlanetStructure(planet) {
  const expectedKeys = [
    'mass',
    'initialX',
    'initialY',
    'initialVelocityX',
    'initialVelocityY',
    'color',
    'name',
    'radius',
  ]

  // Check if all expected keys are present in the planet data
  return expectedKeys.every((key) => key in planet)
}

/**
 * Loads and checks the structure of a JSON file containing planet configurations.
 *
 * @param {string} jsonPath - The path to the JSON file.
 * @returns {Promise<Object[]>} - Returns the parsed JSON data if valid.
 * @throws {Error} - Throws an error if the file can't be read or the structure is invalid.
 */
async function loadAndCheckPlanetsJSON(jsonPath) {
  try {
    const jsonString = await fs.readFile(jsonPath, 'utf8')
    const planetsData = JSON.parse(jsonString)

    if (!Array.isArray(planetsData)) {
      throw new Error('The JSON data is not an array.')
    }

    for (const planet of planetsData) {
      if (!validatePlanetStructure(planet)) {
        throw new Error(`Invalid structure for planet: ${planet.name}`)
      }
    }

    return planetsData
  } catch (err) {
    throw new Error(`Failed to load or validate planets JSON from ${jsonPath}: ${err.message}`)
  }
}

export default loadNBodyFromJSON
