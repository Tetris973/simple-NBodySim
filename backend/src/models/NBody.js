/**
 * Create an NBody object.
 * An Nbody object represents a particle in the n-body simulation.
 *
 * @param {number} mass - The mass of the object.
 * @param {number} x0 - Initial x position.
 * @param {number} y0 - Initial y position.
 * @param {number} vx0 - Initial x velocity.
 * @param {number} vy0 - Initial y velocity.
 * @param {string} name - Name of the object.
 * @returns {NBody} The created NBody object.
 */
function NBody(mass, x0, y0, vx0, vy0, name) {
  const obj = Object.create(NBody.prototype)
  obj._mass = mass
  obj.pos = { x: x0, y: y0 }
  obj.vel = { x: vx0, y: vy0 }
  obj.acc = { x: 0, y: 0 }
  obj.name = name
  return obj
}

/**
 * Gets or sets the mass of the NBody object.
 * @type {number}
 */
Object.defineProperty(NBody.prototype, 'mass', {
  get: function () {
    return this._mass
  },
  set: function (value) {
    this._mass = value
  },
})

/**
 * Gets or sets the velocity of the NBody object.
 * @type {Object}
 * @property {number} x - The x component of the velocity.
 * @property {number} y - The y component of the velocity.
 */
Object.defineProperty(NBody.prototype, 'velocity', {
  get: function () {
    return { x: this.vel.x, y: this.vel.y }
  },
  set: function ({ x, y }) {
    this.vel.x = x
    this.vel.y = y
  },
})

/**
 * Gets or sets the acceleration of the NBody object.
 * @type {Object}
 * @property {number} x - The x component of the acceleration.
 * @property {number} y - The y component of the acceleration.
 */
Object.defineProperty(NBody.prototype, 'acceleration', {
  get: function () {
    return { x: this.acc.x, y: this.acc.y }
  },
  set: function ({ x, y }) {
    this.acc.x = x
    this.acc.y = y
  },
})

/**
 * Gets or sets the position of the NBody object.
 * @type {Object}
 * @property {number} x - The x-coordinate of the NBody's position.
 * @property {number} y - The y-coordinate of the NBody's position.
 */
Object.defineProperty(NBody.prototype, 'position', {
  get: function () {
    return { x: this.pos.x, y: this.pos.y }
  },
  set: function ({ x, y }) {
    this.pos.x = x
    this.pos.y = y
  },
})

export default NBody
