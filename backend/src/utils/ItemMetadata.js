/**
 * Represents metadata for items.
 * @constructor
 * @param {string} id - Unique identifier.
 * @param {string} [description="Description of {id}"] - Descriptive information.
 */
function ItemMetadata(id, description = 'Description of ' + id) {
  const obj = Object.create(null)

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  /**
   * Represents the unique identifier.
   * @name ItemMetadata#id
   * @type {string}
   * @readonly
   * @public
   */
  Object.defineProperty(obj, 'id', {
    value: id,
    enumerable: true,
  })

  /**
   * Represents the title.
   * @name ItemMetadata#title
   * @type {string}
   * @default id
   * @public
   */
  Object.defineProperty(obj, 'title', {
    value: id,
    writable: true,
    enumerable: true,
  })

  /**
   * Represents descriptive information.
   * @name ItemMetadata#description
   * @type {string}
   * @default "Description of {id}"
   * @public
   */
  Object.defineProperty(obj, 'description', {
    value: description,
    writable: true,
    enumerable: true,
  })

  return obj
}

export { ItemMetadata }
