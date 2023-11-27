/**
 * @module Float64StructArrayLibrary
 */

/**
 * Represents the Float64Array when it has some data, including ACTIVE, DELETED, and struct data.
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
 */
const Flags = Object.freeze({
  DELETED: -Infinity,
  END: NaN,
  ACTIVE: Infinity,
})

/**
 * The number of Float64 values used to represent the status flags.
 * @type {number}
 * @constant
 */
const NB_STRUCT_FLAGS = 1

/**
 * The number of Float64 values used to represent the array flags.
 * @type {number}
 * @constant
 */
const NB_ARRAY_FLAGS = 1

/**
 * Expands a Float64Array initialized by the library and copies the existing data to the new array.
 *
 * @param {Float64Array} array - The original Float64Array that needs more space.
 * @param {number} nbStructToAdd - The number of structs to add to the array.
 * @returns {Float64Array} A new Float64Array with additional space and copied data.
 * @throws {Error} Throws an error if additionalFields is not a positive integer.
 */
const expand = (array, nbStructToAdd, factoryFunction) => {
  if (!Number.isInteger(nbStructToAdd) || nbStructToAdd <= 0) {
    throw new Error('nbStructToAdd should be a positive integer.')
  }

  const newArray = factoryFunction(array.structSize, array.nbMaxStruct + nbStructToAdd)

  // Copy existing data
  newArray.set(array)

  // Update writable properties
  newArray.nbCurrentStruct = array.nbCurrentStruct
  newArray.lastIndex = array.lastIndex
  newArray.nbToDelete = array.nbToDelete
  return newArray
}

/**
 * Adds a new struct to a Float64Array, sets it as active, and adds an end flag.
 *
 * @param {Float64Array} array - The Float64Array in which the struct will be added.
 * @param {number[]} [dataArray] - Array of data to set in the new struct. If not given, all fields are set to 0.
 * @returns {number} The logical index of the new struct in the array.
 * @throws {Error} If the dataArray length does not match the struct size.
 * @throws {Error} If there is not enough space in the array to add the new struct.
 */
const addStruct = (array, dataArray) => {
  const structSize = array.structSize
  const startFlagIndex = array.lastIndex
  const structStartIndex = startFlagIndex + 1
  const structEndIndex = structStartIndex + structSize - 1
  const endFlagIndex = structEndIndex + 1

  if (structEndIndex >= array.length) {
    throw new Error('Not enough space in the array to add the new struct.')
  }

  if (!isNaN(array[startFlagIndex])) {
    throw new Error(
      `Expected END flag: ${Flags.END} at index ${startFlagIndex}, but found ${array[startFlagIndex]}.`
    )
  }

  if (dataArray && dataArray.length !== structSize) {
    throw new Error(
      `The length of dataArray (${dataArray.length}) does not match the struct size (${structSize}).`
    )
  }

  array[startFlagIndex] = Flags.ACTIVE
  for (let i = 0; i < structSize; i++) {
    array[structStartIndex + i] = dataArray ? dataArray[i] : 0
  }
  array[endFlagIndex] = Flags.END

  array.lastIndex = endFlagIndex
  array.nbCurrentStruct += 1
  const logicalIndex = array.nbCurrentStruct - 1

  return logicalIndex
}

/**
 * Marks a struct in a Float64Array as deleted.
 *
 * This function sets the status of a specific struct in the array to "deleted".
 * It does not actually remove the struct data from the array; it merely changes its status.
 *
 * @param {Float64Array} array - The Float64Array containing the structs.
 * @param {number} index - The logical index of the struct in the array.
 * @throws {Error} Throws an error if the index is out of bounds.
 * @throws {Error} Throws an error if the index does not represent the start of a struct.
 */
const markStructAsDeleted = (array, index) => {
  if (index < 0 || index >= array.nbMaxStruct) {
    throw new Error('Index is out of bounds.')
  }
  if (index >= array.nbCurrentStruct) {
    throw new Error('No valid struct at the specified index.')
  }

  const startIndex = getStartIndex(array, index)
  const flagIndex = startIndex - 1

  const flag = array[flagIndex]

  if (flag === Flags.ACTIVE) {
    array[flagIndex] = Flags.DELETED
    array.nbToDelete += 1
  }
}

/**
 * Calculates the physical index of the first element of the struct in the array based on its logical index.
 * The physical index accounts for flags and deleted structs.
 *
 * @param {Float64Array} array - The Float64Array managed by StructuredFloat64Array factory function.
 * @param {number} logicalIndex - The logical index of the struct (i.e., the struct's position in the array ignoring flags and deletions).
 * @returns {number} The physical index of the first element of the struct in the array.
 * @throws {Error} Throws an error if the logical index is out of bounds.
 */
function getStartIndex(array, logicalIndex) {
  if (!Number.isInteger(logicalIndex) || logicalIndex < 0 || logicalIndex >= array.nbMaxStruct) {
    console.log(logicalIndex, array.nbMaxStruct)
    throw new Error('The logical index is out of bounds.')
  }

  const physicalIndex = logicalIndex * (array.structSize + NB_STRUCT_FLAGS) + NB_STRUCT_FLAGS

  return physicalIndex
}

/**
 *
 * @param {Float64Array} array - The Float64Array managed by StructuredFloat64Array factory function.
 * @param {number} logicalIndex - The logical index of the struct (i.e., the struct's position in the array ignoring flags and deletions).
 * @returns {number} The physical index of the status flag in the array.
 */
function getStatusFlagIndex(array, logicalIndex) {
  const physicalIndex = getStartIndex(array, logicalIndex)
  return physicalIndex - 1
}

/**
 * Iteratively identifies structs marked as DELETED and compacts the array by delegating to the compactAtIndexes function.
 * This function builds an array of indexes where structs are marked as DELETED and then calls compactAtIndexes to perform the actual deletion.
 *
 * @param {Float64Array} array - The Float64Array managed by the StructuredFloat64Array factory function.
 * @param {number} [startIndex=0] - The starting logical index for identifying deletions.
 * @return {number} The total number of structs removed. Returns 0 if no deletions are found.
 */
function compactIterative(array, startIndex = 0) {
  let indexesToDelete = []
  for (let i = startIndex; i < array.nbMaxStruct; i++) {
    const posFlag = getStatusFlagIndex(array, i)
    if (array[posFlag] === Flags.DELETED) {
      indexesToDelete.push(i)
    }
  }

  // if array emty then return 0
  return indexesToDelete.length ? compactAtIndexes(array, indexesToDelete) : 0
}

/**
 * Compacts the Float64Array by either deleting specific structs or performing an iterative compaction.
 * If specific indexes to delete are provided, it deletes those structs; otherwise, it iteratively finds and deletes structs marked as DELETED.
 * After compaction, it updates struct counts and zero-fills the truncated end of the array.
 *
 * @param {Float64Array} array - The Float64Array managed by the StructuredFloat64Array factory function.
 * @param {number[]} [indexesToDelete=[]] - An array of logical indexes of structs to delete. If empty, an iterative deletion process is used.
 */
function compact(array, indexesToDelete = []) {
  let deletedStructCount = 0
  if (indexesToDelete.length) {
    deletedStructCount = compactAtIndexes(array, indexesToDelete)
  } else {
    deletedStructCount = compactIterative(array)
  }

  array.nbCurrentStruct -= deletedStructCount
  array.nbToDelete -= deletedStructCount

  const fieldsToZeroFill = deletedStructCount * (array.structSize + NB_STRUCT_FLAGS)
  array.fill(0, array.lastIndex + 1, array.lastIndex + fieldsToZeroFill + 1)
}

/**
 * Moves a chunk of structs within the array to a specified target position. This function is useful for reorganizing data after deletion operations.
 *
 * @param {Float64Array} array - The Float64Array managed by StructuredFloat64Array factory function.
 * @param {number} targetPosition - The logical index where the chunk will be moved to.
 * @param {number} sourcePosition - The logical index where the chunk starts.
 * @param {number} nbStructsToMove - The number of structs to move.
 * @throws {Error} Throws an error if the target or source positions are out of bounds.
 */
function moveChunk(array, targetPosition, sourcePosition, nbStructsToMove) {
  if (targetPosition < 0 || targetPosition >= array.nbMaxStruct) {
    throw new Error('Target position is out of bounds.')
  }
  if (sourcePosition < 0 || sourcePosition + nbStructsToMove > array.nbCurrentStruct) {
    throw new Error('Source position is out of bounds or chunk is too large.')
  }

  const destinationIndex = getStatusFlagIndex(array, targetPosition)
  const sourceIndex = getStatusFlagIndex(array, sourcePosition)
  const nbFieldsToMove = nbStructsToMove * (array.structSize + NB_STRUCT_FLAGS)

  // Shift data to compact the array
  array.copyWithin(destinationIndex, sourceIndex, sourceIndex + nbFieldsToMove)
}

/**
 * Processes deletion of chunks of consecutive structs based on a sorted array of indexes to delete.
 * This function facilitates batch deletion and compaction of the Float64Array.
 *
 * @param {Float64Array} array - The array containing structs.
 * @param {number[]} indexesToDelete - The sorted array of logical indexes of the structs to delete.
 * @returns {number} The total number of structs deleted.
 * @throws {Error} Throws an error if the length of indexesToDelete does not match the expected number of deletions (array.nbToDelete).
 */
function compactAtIndexes(array, indexesToDelete) {
  if (indexesToDelete.length !== array.nbToDelete) {
    throw new Error(
      `Length of indexes to delete (${indexesToDelete.length}) does not match the expected number of deletions (${array.nbToDelete} ).`
    )
  }

  let nbTotalDeleted = 0
  let currentChunkStartIndex = null
  let currentChunkSize = 0

  for (let i = 0; i < indexesToDelete.length; i++) {
    if (currentChunkStartIndex === null) {
      currentChunkStartIndex = indexesToDelete[i]
      currentChunkSize = 1
    } else if (indexesToDelete[i] === currentChunkStartIndex + currentChunkSize) {
      // Consecutive index, increase the chunk size
      currentChunkSize++
    } else {
      // No more consecutive index, move the current chunk
      const targetPosition = currentChunkStartIndex - nbTotalDeleted
      const sourcePosition = currentChunkStartIndex + currentChunkSize

      // nbstruct to move is equal to de number of Active struct between the current chunk and the next one
      const nbStructToMove = indexesToDelete[i] - (currentChunkStartIndex + currentChunkSize)
      moveChunk(array, targetPosition, sourcePosition, nbStructToMove)
      nbTotalDeleted += currentChunkSize

      // Start a new chunk
      currentChunkStartIndex = indexesToDelete[i]
      currentChunkSize = 1
    }
  }

  // Shifts lasts active structs if the last struct deleted is not the array's final struct
  // skips this step if it is the last.
  const indexLastStructToDelete = indexesToDelete[indexesToDelete.length - 1]
  if (indexLastStructToDelete !== array.nbCurrentStruct - 1) {
    const targetPosition = currentChunkStartIndex - nbTotalDeleted
    const sourcePosition = currentChunkStartIndex + currentChunkSize
    const nbStructToMove = array.nbCurrentStruct - indexLastStructToDelete - 1
    moveChunk(array, targetPosition, sourcePosition, nbStructToMove)
  }

  // Move the END Flag
  nbTotalDeleted += currentChunkSize
  array[array.lastIndex] = 0
  array.lastIndex -= nbTotalDeleted * (array.structSize + NB_STRUCT_FLAGS)
  array[array.lastIndex] = Flags.END

  // to delete
  const nbFieldsZero = nbTotalDeleted * (array.structSize + NB_STRUCT_FLAGS)
  array.fill(0, array.lastIndex + 1, array.lastIndex + nbFieldsZero + 1)
  return nbTotalDeleted
}

export {
  expand,
  addStruct,
  markStructAsDeleted,
  getStartIndex,
  getStatusFlagIndex,
  compact,
  Flags,
  NB_STRUCT_FLAGS,
  NB_ARRAY_FLAGS,
}
