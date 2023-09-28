import { Vector } from 'p5-sketch-editor'

/**
 * Factory function to create an NBody object.
 *
 * @param {number} mass - The mass of the object.
 * @param {string} name - Name of the object.
 * @returns {NBody} The created NBody object.
 */
function NBody(mass, name) {
  const obj = Object.create(NBody.prototype)
  obj.mass = mass
  obj.pos = new Vector(0, 0)
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
 * Sets the position of the NBody object.
 *
 * @param {number} x The x-coordinate of the NBody's position.
 * @param {number} y The y-coordinate of the NBody's position.
 */
NBody.prototype.setPosition = function (x, y) {
  this.pos.x = x
  this.pos.y = y
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

/** Removing in progress, do nothing */
NBody.prototype.update = function () {
  return
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
