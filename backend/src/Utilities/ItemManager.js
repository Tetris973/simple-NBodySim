import { add, remove, moveUp, moveDown, find, findIndex, get, clear } from './ItemListManagement.js'

/**
 * Creates a generic item manager.
 * @function
 * @param {Object} options - Configuration options for the item manager.
 * @param {function} options.itemFactory - A factory function for creating items.
 * @param {string} [options.identifierKey='id'] - The key used to identify items.
 * @returns {Object} An item manager instance with various methods for managing items.
 */
function ItemManager({ itemFactory, identifierKey = 'id' } = {}) {
  if (typeof itemFactory !== 'function') {
    throw new Error('itemFactory must be a function')
  }

  let items = []

  return {
    /**
     * Adds a new item.
     * @function
     * @param {string} identifier - A unique identifier for the item.
     * @param {...any} args - Arguments for item creation.
     * @throws {Error} Throws an error if item creation fails.
     * @public
     */
    add: (identifier, ...args) => {
      const item = itemFactory(identifier, ...args)
      if (!item) {
        throw new Error('Item creation failed.')
      }
      items = add(items, item)
    },
    remove: (itemId) => {
      items = remove(items, itemId, identifierKey)
    },
    moveUp: (itemId) => {
      items = moveUp(items, itemId, identifierKey)
    },
    moveDown: (itemId) => {
      items = moveDown(items, itemId, identifierKey)
    },
    find: (itemId) => find(items, itemId, identifierKey),
    findIndex: (itemId) => findIndex(items, itemId, identifierKey),
    get: (index) => get(items, index),
    getItems: () => items,
    clear: () => {
      items = clear()
    },
  }
}

export { ItemManager }
