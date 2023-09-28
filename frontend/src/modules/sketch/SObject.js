import { Vector } from 'p5-sketch-editor'

/**
 * Factory function to create an NBody object.
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
  obj.mass = mass
  obj.pos = new Vector(x0, y0)
  obj.vel = new Vector(vx0, vy0)
  obj.acc = new Vector(0, 0)
  obj.name = name
  obj.renderers = [] // Initialize an empty array for renderers
  return obj
}

/**
 * Retrieves the current position of the NBody object.
 *
 * @returns {Object} An object representing the current position of the NBody.
 * @returns {number} .x - The x-coordinate of the NBody's position.
 * @returns {number} .y - The y-coordinate of the NBody's position.
 */
NBody.prototype.getPosition = function () {
  return { x: this.pos.x, y: this.pos.y }
}

/**
 * Adds a renderer function to the NBody's collection of renderers.
 * The renderer function is responsible for drawing a specific aspect of the NBody.
 *
 * @param {function} renderer - The renderer function to be added.
 *      This function should accept a single argument, the drawer,
 *      and use it to draw the desired aspect of the NBody.
 *      It should be of the form: "(drawer) => functionName(drawer)".
 *
 * @throws {Error} Throws an error if the provided renderer is not a function.
 *
 * @example
 * const circleRenderer = (drawer) => {
 *     drawer.ellipse(this.pos.x, this.pos.y, this.r, this.r);
 * };
 * nbody.addRenderer(circleRenderer);
 */
NBody.prototype.addRenderer = function (renderer) {
  if (typeof renderer === 'function') {
    this.renderers.push(renderer)
  } else {
    throw new Error(
      'Provided renderer is not a function. It should be of the form: "(drawer) => functionName(drawer)"'
    )
  }
}

/**
 * Updates the state of the NBody object.
 *
 * @param {number} dt - Time passed since last update.
 * @param {Object[]} everyObjects - List of every object in the simulation.
 */
NBody.prototype.update = function (dt, everyObjects) {
  this.calculateNextAcceleration(dt, everyObjects)
  this.pos.add(Vector.mult(this.vel, dt)).add(Vector.mult(this.acc, (dt * dt) / 2))
  const accCopy = this.acc.copy()
  this.calculateNextAcceleration(dt, everyObjects)
  this.vel.add(Vector.add(accCopy, this.acc).mult(dt / 2))
}

/**
 * Calculates the next acceleration of the NBody object.
 *
 * @param {number} dt - Time passed since last update.
 * @param {NBody[]} everyNbody - List of every Nbody in the simulation.
 */
NBody.prototype.calculateNextAcceleration = function (dt, everyObjects) {
  const G = 6.6743e-11
  this.acc.set(0, 0)

  for (let i = 0; i < everyObjects.length; i++) {
    if (everyObjects[i] === this) continue

    const vectDirection = Vector.sub(this.pos, everyObjects[i].pos)
    const distance = Vector.dist(this.pos, everyObjects[i].pos)
    this.acc
      .add(vectDirection)
      .mult(-G * everyObjects[i].mass)
      .div(distance ** 3)
  }
}

/**
 * Draws the NBody object.
 *
 * @param {Object} drawer - The drawing context or tool.
 */
NBody.prototype.draw = function (drawer) {
  this.renderers.forEach((renderer) => renderer(drawer))
}

export default NBody
