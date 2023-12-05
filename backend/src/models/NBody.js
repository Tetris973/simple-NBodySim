import { ItemMetadata } from '#src/utils/ItemMetadata.js'

/**
 * Creates an NBody particle and initializes its properties in the provided data array.
 * @constructor
 * @param {Object} args - An object containing the initial values for the NBody particle's properties.
 * @param {string} args.name - Name of Nbody.
 * @param {number} args.mass - Initial mass.
 * @param {number} args.x - Initial x-coordinate
 * @param {number} args.y - Initial y-coordinate
 * @param {number} args.vx - Initial x-velocity
 * @param {number} args.vy - initial y-velocity
 * @returns {NBody} The created NBody object.
 */
function NBody(args) {
  const { name, mass, x, y, vx, vy } = args
  const metadata = ItemMetadata(name)

  const nBody = {
    ...metadata,

    /**
     * mass of the NBody.
     * @name NBody#mass
     * @type {number}
     * @public
     */
    mass,

    /**
     * 2D Position of the NBody.
     * @name NBody#pos
     * @type {Object}
     * @property {number} x - The x-coordinate of the NBody's position.
     * @property {number} y - The y-coordinate of the NBody's position.
     * @public
     */
    pos: { x: x ? x : 0, y: y ? y : 0 },

    /**
     * 2D Velocity of the NBody.
     * @name NBody#vel
     * @type {Object}
     * @property {number} x - The x component of the velocity.
     * @property {number} y - The y component of the velocity.
     * @public
     */
    vel: { x: vx ? vx : 0, y: vy ? vy : 0 },

    /**
     * 2D acceleration of the NBody.
     * @name NBody#acc
     * @type {Object}
     * @property {number} x - The x component of the acceleration.
     * @property {number} y - The y component of the acceleration.
     * @public
     */
    acc: { x: 0, y: 0 },
  }

  return nBody
}

export { NBody }
