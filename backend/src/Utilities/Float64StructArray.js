import * as lib from './Float64StructArrayLibrary.js'

/**
 * Factory function to create a Float64Array structured for managing a collection of structs.
 * Each struct within the array is prepended with a flag (e.g., ACTIVE, DELETED).
 *
 * @example
 * ```
 * // The array representation with some data.
 * // +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
 * // | ∞ | D1 | D2 | D3 | D4 | -∞| D1 | D2 | D3 | D4 | ∞ | D1 | D2 | D3 | D4 |NaN|   |   |
 * // +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
 * // 'NaN' represents the END flag.
 * // '∞' represents the ACTIVE flag.
 * // '-∞' represents the DELETED flag.
 * // 'Dx' represents struct data.
 * // Empty spaces represent unassigned or uninitialized Float64 values.
 *
 * // In this example:
 * // - The first struct starts at index 1 and ends at index 5. It is active.
 * // - The second struct starts at index 7 and ends at index 11. It has been deleted.
 * // - The third struct starts at index 13 and ends at index 16. It is active.
 *
 * // Please note that the actual struct data ('Dx') would be floating point numbers,
 * // and this is just a simplified representation for visualization purposes.
 * ```
 * Represents the Float64Array when it is in an empty state.
 *
 * @example
 * ```
 * // The array representation when it is empty.
 * // +---+---+---+---+---+---+---+---+---+
 * // |NaN|   |   |   |   |   |   |   |   |
 * // +---+---+---+---+---+---+---+---+---+
 * // 'NaN' represents the END flag.
 * // Empty spaces represent unassigned or uninitialized Float64 values.
 * ```
 *
 * @param {number} structSize - The size of each struct in the array.
 * @param {number} nbStruct - The number of structs to accommodate within the array.
 * @returns {Float64Array} A Float64Array with custom properties to manage the structured data.
 * @throws {Error} Throws an error if structSize or nbStruct are not positive integers.
 */
function Float64StructArray(structSize, nbStruct = 1) {
  if (!Number.isInteger(structSize) || structSize <= 0) {
    throw new Error('structSize should be a positive integer.')
  }

  if (!Number.isInteger(nbStruct) || nbStruct <= 0) {
    throw new Error('nbStruct should be a positive integer.')
  }

  const totalSize = (structSize + lib.NB_STRUCT_FLAGS) * nbStruct + lib.NB_ARRAY_FLAGS
  const array = new Float64Array(totalSize)
  array[0] = lib.Flags.END

  /**
   * The size of each struct, representing the number of Float64 fields within each struct.
   * @type {number}
   * @const
   */
  Object.defineProperty(array, 'structSize', { value: structSize })

  /**
   * The number of structs currently stored within the array.
   * @type {number}
   */
  Object.defineProperty(array, 'nbCurrentStruct', { value: 0, writable: true })

  /**
   * The maximum number of structs the array can store, as defined by the initial configuration.
   * @type {number}
   * @const
   */
  Object.defineProperty(array, 'nbMaxStruct', { value: nbStruct })

  /**
   * The index of the last struct in the array. This index points to where the next struct would be placed.
   * @type {number}
   */
  Object.defineProperty(array, 'lastIndex', { value: 0, writable: true })

  /**
   * The number of structs that have been marked for deletion within the array.
   * @type {number}
   */
  Object.defineProperty(array, 'nbToDelete', { value: 0, writable: true })

  return array
}

export { Float64StructArray }
