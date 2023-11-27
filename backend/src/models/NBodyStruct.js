import { ItemMetadata } from '../utilities/ItemMetadata.js'

/**
 * @constant
 * @type {Object}
 * @property {number} MASS - Index for mass in the NBody properties array.
 * @property {number} X_POS - Index for x-coordinate position in the NBody properties array.
 * @property {number} Y_POS - Index for y-coordinate position in the NBody properties array.
 * @property {number} X_VEL - Index for x-coordinate velocity in the NBody properties array.
 * @property {number} Y_VEL - Index for y-coordinate velocity in the NBody properties array.
 * @property {number} X_ACC - Index for x-coordinate acceleration in the NBody properties array.
 * @property {number} Y_ACC - Index for y-coordinate acceleration in the NBody properties array.
 * @description Object containing constants that represent the indices of various properties in the NBody properties array.
 */
const Index = Object.freeze({
  MASS: 0,
  X_POS: 1,
  Y_POS: 2,
  X_VEL: 3,
  Y_VEL: 4,
  X_ACC: 5,
  Y_ACC: 6,
})

/**
 * @constant
 * @type {number}
 * @description The total number of properties per NBody, computed based on the number of keys in the index object.
 */
const NB_PROPERTIES = Object.keys(Index).length

/**
 * Creates an NBody particle and initializes its properties in the provided data array.
 * @constructor
 * @param {Float64Array} data - A typed array to store the properties of all the particles in the simulation.
 *                              Each particle has a designated section in this array.
 * @param {number} nBodyOffset - The starting index of the NBody particle's properties in the data array.
 * @param {Object} args - An object containing the initial values for the NBody particle's properties.
 * @param {string} args.name - The name of the NBody particle, used for identification.
 * @param {number} args.mass - The mass of the NBody particle.
 * @param {number} args.x - The initial x-coordinate of the NBody particle.
 * @param {number} args.y - The initial y-coordinate of the NBody particle.
 * @param {number} args.vx - The initial x velocity of the NBody particle.
 * @param {number} args.vy - The initial y velocity of the NBody particle.
 */
function NBodyStruct(data, nBodyOffset, args) {
  const { name, mass, x, y, vx, vy } = args
  const metadata = ItemMetadata(name)

  const nBody = {
    ...metadata,

    /**
     * Retrieves the mass of the NBody particle.
     * @function
     * @returns {number} The mass of the NBody particle.
     */
    getMass: () => getField(data.array, nBodyOffset + Index.MASS),

    /**
     * Sets the mass of the NBody particle.
     * @function
     * @param {number} value - The new mass of the NBody particle.
     */
    setMass: (value) => setField(data.array, nBodyOffset + Index.MASS, value, Infinity, 0),

    /**
     * Retrieves the position of the NBody particle.
     * @function
     * @returns {{x: number, y: number}} The x and y coordinates of the NBody particle.
     */
    getPosition: () => ({
      x: getField(data.array, nBodyOffset + Index.X_POS),
      y: getField(data.array, nBodyOffset + Index.Y_POS),
    }),

    /**
     * Sets the position of the NBody particle.
     * @function
     * @param {{x: number, y: number}} position - The new position of the NBody particle.
     */
    setPosition: ({ x, y }) => {
      setField(data.array, nBodyOffset + Index.X_POS, x)
      setField(data.array, nBodyOffset + Index.Y_POS, y)
    },

    /**
     * Retrieves the velocity of the NBody particle.
     * @function
     * @returns {{x: number, y: number}} The x and y components of the velocity of the NBody particle.
     */
    getVelocity: () => ({
      x: getField(data.array, nBodyOffset + Index.X_VEL),
      y: getField(data.array, nBodyOffset + Index.Y_VEL),
    }),

    /**
     * Sets the velocity of the NBody particle.
     * @function
     * @param {{x: number, y: number}} velocity - The new velocity of the NBody particle.
     */
    setVelocity: ({ x, y }) => {
      setField(data.array, nBodyOffset + Index.X_VEL, x)
      setField(data.array, nBodyOffset + Index.Y_VEL, y)
    },

    /**
     * Retrieves the acceleration of the NBody particle.
     * @function
     * @returns {{x: number, y: number}} The x and y components of the acceleration of the NBody particle.
     */
    getAcceleration: () => ({
      x: getField(data.array, nBodyOffset + Index.X_ACC),
      y: getField(data.array, nBodyOffset + Index.Y_ACC),
    }),

    /**
     * Sets the acceleration of the NBody particle.
     * @function
     * @param {{x: number, y: number}} acceleration - The new acceleration of the NBody particle.
     */
    setAcceleration: ({ x, y }) => {
      setField(data.array, nBodyOffset + Index.X_ACC, x)
      setField(data.array, nBodyOffset + Index.Y_ACC, y)
    },
  }

  nBody.setMass(mass)
  nBody.setPosition({ x, y })
  nBody.setVelocity({ x: vx, y: vy })
  nBody.setAcceleration({ x: 0, y: 0 })

  return nBody
}

/**
 * Sets a value in a typed array at a specific index, with optional upper and lower bounds.
 *
 * @param {Float64Array} data - A typed array where the value needs to be set.
 * @param {number} idx - The index in the typed array where the value needs to be set.
 * @param {number} value - The value to set at the specified index in the data array.
 * @param {number} [upperBound=Infinity] - The upper bound for the value. Defaults to Infinity.
 * @param {number} [lowerBound=-Infinity] - The lower bound for the value. Defaults to -Infinity.
 *
 * @throws {Error} Will throw an error if the value is out of the specified bounds.
 */
function setField(data, idx, value, upperBound = Infinity, lowerBound = -Infinity) {
  if (value > upperBound || value < lowerBound) {
    throw new Error(
      `Value out of bounds: ${value}. Must be between ${lowerBound} and ${upperBound}.`
    )
  }
  data[idx] = value
}

/**
 * Retrieves a value from a typed array at a specific index.
 *
 * @param {Float64Array} data - A typed array from which the value needs to be retrieved.
 * @param {number} idx - The index in the typed array from which the value needs to be retrieved.
 * @returns {number} The value at the specified index in the data array.
 */
function getField(data, idx) {
  return data[idx]
}

export { NBodyStruct, Index as NBodyPropertyIndices, NB_PROPERTIES as N_BODY_PROPERTIES_COUNT }
