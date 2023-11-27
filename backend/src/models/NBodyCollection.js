import { ItemMetadata } from '../utilities/ItemMetadata.js'

/**
 * Represents a collection of NBody objects.
 * @constructor
 * @param {string} id - Unique identifier for the NBody collection.
 * @param {Array} nBodies - An array of NBody objects to initialize the collection.
 * @returns {Object} The NBodyCollection instance.
 */
function NBodyCollection(id, nBodies) {
  const metadata = ItemMetadata(id)
  const collection = [...nBodies]

  const obj = {
    ...metadata,

    /**
     * Gets a copy of the collection of NBody objects.
     * @name NBodyCollection#nBodies
     * @type {Array}
     */
    get nBodies() {
      return [...collection]
    },

    /**
     * Retrieves an NBody object from the collection at the specified index.
     * @function
     * @name NBodyCollection#getNBody
     * @param {number} index - The index of the NBody object to retrieve.
     * @returns {Object} The NBody object.
     * @throws {Error} Throws an error if the index is out of bounds.
     */
    getNBody: (index) => getNBody(collection, index),

    /**
     * Adds an NBody object to the collection.
     * @function
     * @name NBodyCollection#addNBody
     * @param {Object} nBody - The NBody object to add.
     */
    addNBody: (nBody) => addNBody(collection, nBody),

    /**
     * Removes an NBody object from the collection at the specified index.
     * @function
     * @name NBodyCollection#removeNBody
     * @param {number} index - The index of the NBody object to remove.
     * @throws {Error} Throws an error if the index is out of bounds.
     */
    removeNBody: (index) => removeNBody(collection, index),

    /**
     * Gets the size of the collection.
     * @function
     * @name NBodyCollection#size
     * @returns {number} The number of NBody objects in the collection.
     */
    size: () => size(collection),
  }

  return obj
}

/**
 * Internal function to get an NBody object from a collection.
 * @param {Array} collection - The collection of NBody objects.
 * @param {number} index - The index of the NBody object to retrieve.
 * @returns {Object} The NBody object.
 * @throws {Error} Throws an error if the index is out of bounds.
 */
const getNBody = (collection, index) => {
  if (index < 0 || index >= collection.length) {
    throw new Error('Index out of bounds')
  }
  return collection[index]
}

/**
 * Internal function to add an NBody object to a collection.
 * @param {Array} collection - The collection of NBody objects.
 * @param {Object} nBody - The NBody object to add.
 */
const addNBody = (collection, nBody) => {
  collection.push(nBody)
}

/**
 * Internal function to remove an NBody object from a collection.
 * @param {Array} collection - The collection of NBody objects.
 * @param {number} index - The index of the NBody object to remove.
 * @throws {Error} Throws an error if the index is out of bounds.
 */
const removeNBody = (collection, index) => {
  if (index < 0 || index >= collection.length) {
    throw new Error('Index out of bounds')
  }
  collection.splice(index, 1)
}

/**
 * Internal function to get the size of a collection.
 * @param {Array} collection - The collection of NBody objects.
 * @returns {number} The number of NBody objects in the collection.
 */
const size = (collection) => collection.length

export { NBodyCollection }
