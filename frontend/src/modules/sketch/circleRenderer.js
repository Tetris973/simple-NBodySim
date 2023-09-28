/**
 * Factory function to create a CircleRenderer object.
 *
 * @param {Function} getPosition - A function that returns the position of the object.
 * @returns {Object} The position object.
 * @returns {number} The position object.x - The x-coordinate of the object.
 * @returns {number} The position object.y - The y-coordinate of the object.
 * @param {number[]} color - RGB color array.
 * @param {number} r - Radius of the circle.
 * @returns {CircleRenderer} The created CircleRenderer object.
 */
function CircleRenderer(getPosition, color, r) {
  const obj = Object.create(CircleRenderer.prototype)
  obj.getPosition = getPosition
  obj.color = color
  obj.r = r
  return obj
}

/**
 * Draws the circle.
 *
 * @param {Object} drawer - The drawing context or tool.
 */
CircleRenderer.prototype.draw = function (drawer) {
  const position = this.getPosition()
  drawer
    .noStroke()
    .fill(this.color[0], this.color[1], this.color[2])
    .ellipse(position.x, position.y, this.r, this.r, true)
}

export default CircleRenderer
