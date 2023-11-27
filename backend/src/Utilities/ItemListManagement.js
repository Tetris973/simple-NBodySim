/**
 * Adds an item at the end of the list.
 * @function
 * @param {Array} items - The current list of items.
 * @param {*} item - The item to add to the list.
 * @returns {Array} A new array with the item added.
 */
const add = (items, item) => [...items, item]

/**
 * Removes an item from the list based on its identifier.
 * If multiple items have the same identifier, only the first item is removed.
 * If the item is not found, the original array is returned.
 * @function
 * @param {Array} items - The current list of items.
 * @param {*} itemId - The identifier of the item to remove.
 * @param {string} [identifierKey='id'] - The key used to identify items.
 * @returns {Array} A new array with the item removed.
 */
const remove = (items, itemId, identifierKey = 'id') =>
  items.filter((item) => item[identifierKey] !== itemId)

/**
 * Moves an item up by one position in the list.
 * If the item is already at the top, the original array is returned.
 * @function
 * @param {Array} items - The current list of items.
 * @param {*} itemId - The identifier of the item to move.
 * @param {string} [identifierKey='id'] - The key used to identify items.
 * @returns {Array} A new array with the item moved up, or the original array if the item was not found or is already at the top.
 */
const moveUp = (items, itemId, identifierKey = 'id') => {
  const index = findIndex(items, itemId, identifierKey)
  if (index <= 0) return items
  return [...items.slice(0, index - 1), items[index], items[index - 1], ...items.slice(index + 1)]
}

/**
 * Moves an item down by one position in the list.
 * If the item is already at the bottom, the original array is returned.
 * @function
 * @param {Array} items - The current list of items.
 * @param {*} itemId - The identifier of the item to move.
 * @param {string} [identifierKey='id'] - The key used to identify items.
 * @returns {Array} A new array with the item moved down, or the original array if the item was not found or is already at the bottom.
 */
const moveDown = (items, itemId, identifierKey = 'id') => {
  const index = findIndex(items, itemId, identifierKey)
  if (index === -1 || index === items.length - 1) return items
  return [...items.slice(0, index), items[index + 1], items[index], ...items.slice(index + 2)]
}

/**
 * Sets the position of an item in the list.
 * @function
 * @param {Array} items - The current list of items.
 * @param {*} itemId - The identifier of the item to move.
 * @param {number} newPosition - The new position index for the item.
 * @param {string} [identifierKey='id'] - The key used to identify items.
 * @returns {Array} A new array with the item moved to the new position, or the original array if the item was not found.
 * @throws {Error} Throws an error if the new position is out of bounds.
 */
const setPosition = (items, itemId, newPosition, identifierKey = 'id') => {
  if (newPosition < 0 || newPosition >= items.length) {
    throw new Error('The new position is out of bounds.')
  }

  const item = find(items, itemId, identifierKey)
  if (!item) {
    console.error('Item not found.')
    return items
  }

  let tempItems = remove(items, itemId, identifierKey)
  tempItems = [...tempItems.slice(0, newPosition), item, ...tempItems.slice(newPosition)]
  return tempItems
}

/**
 * Finds and returns an item based on its identifier.
 * @function
 * @param {Array} items - The current list of items.
 * @param {*} itemId - The identifier of the item to find.
 * @param {string} [identifierKey='id'] - The key used to identify items.
 * @returns {*} The found item, or undefined if not found.
 */
const find = (items, itemId, identifierKey = 'id') =>
  items.find((item) => item[identifierKey] === itemId)

/**
 * Finds the index of an item based on its identifier.
 * @function
 * @param {Array} items - The current list of items.
 * @param {*} itemId - The identifier of the item to find.
 * @param {string} [identifierKey='id'] - The key used to identify items.
 * @returns {number} The index of the found item or -1 if not found.
 */
const findIndex = (items, itemId, identifierKey = 'id') =>
  items.findIndex((item) => item[identifierKey] === itemId)

/**
 * Retrieves an item based on its index in the list.
 * @function
 * @param {Array} items - The current list of items.
 * @param {number} index - The index of the item to retrieve.
 * @returns {*} The item at the specified index, or undefined if the index is out of bounds.
 */
const get = (items, index) => items[index]

/**
 * Clears all items from the list.
 * @function
 * @param {Array} items - The current list of items.
 * @returns {Array} A new empty array.
 */
const clear = () => []

export default {
  add,
  remove,
  moveUp,
  moveDown,
  setPosition,
  find,
  findIndex,
  get,
  clear,
}

export { add, remove, moveUp, moveDown, setPosition, find, findIndex, get, clear }
