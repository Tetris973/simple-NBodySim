/**
 * Factory function to create a PathRenderer object.
 *
 * @param {Function} getPosition - A function that returns the position of the object.
 * @returns {Object} The position object.
 * @returns {number} The position object.x - The x-coordinate of the object.
 * @returns {number} The position object.y - The y-coordinate of the object.
 * @param {number[]} color - RGB color array.
 * @param {boolean} [showPath=true] - Flag to determine if the path should be shown.
 * @param {number} [pathLength=500] - The maximum length of the path to be stored and displayed.
 * @returns {PathRenderer} The created PathRenderer object.
 */
function PathRenderer(getPosition, color, showPath = true, pathLength = 1000) {
  const obj = Object.create(PathRenderer.prototype)
  obj.getPosition = getPosition
  obj.color = color
  obj.showPath = showPath
  obj.pathLength = pathLength
  obj.path = []
  return obj
}

/**
 * Updates the path of the object.
 */
PathRenderer.prototype.updatePath = function () {
  const position = this.getPosition()
  if (!position.x && !position.y) return

  if (this.path.length === 0 || this.shouldAddPosition(position)) {
    this.path.push([position.x, position.y])
  }

  while (this.path.length > this.pathLength) this.path.shift()
}

/**
 * Determines whether a new position should be added to the path based on the distance traveled
 * since the last position and the current time. This function uses a combination of distance
 * thresholds and time modulos to decide when to capture a new position.
 *
 * The purpose of combining distance and time is to:
 * 1. Ensure that slow-moving objects still have a visible path by capturing positions at regular time intervals.
 * 2. Optimize performance by limiting the number of points added for fast-moving objects.
 * 3. Provide flexibility in controlling the appearance and density of the path.
 *
 * @param {Object} position - The current position of the object.
 * @param {number} position.x - The x-coordinate of the object's current position.
 * @param {number} position.y - The y-coordinate of the object's current position.
 *
 * @returns {boolean} - Returns `true` if the position should be added to the path, otherwise `false`.
 *
 * @example
 *
 * // If the object has moved a distance of 8 units since the last captured position and the current
 * // time in milliseconds is even, the function will return true based on the first condition.
 * shouldAddPosition({ x: 50, y: 50 });
 *
 */
PathRenderer.prototype.shouldAddPosition = function (position) {
  const lastPoint = this.path[this.path.length - 1]
  const distance = Math.sqrt((position.x - lastPoint[0]) ** 2 + (position.y - lastPoint[1]) ** 2)

  const conditions = [
    { distanceUnit: 5, modulo: 1 }, // For very slow movement, add position every time
    { distanceUnit: 10, modulo: 4 }, // For slow movement, add position every 2 milliseconds
    { distanceUnit: 20, modulo: 8 }, // For moderate movement, add position every 4 milliseconds
    { distanceUnit: Infinity, modulo: 1 }, // For fast movement, add position every 8 milliseconds
  ]

  for (let condition of conditions) {
    if (distance < condition.distanceUnit && new Date().getTime() % condition.modulo === 0) {
      return true
    }
  }

  return false
}

/**
 * Draws the path of the object.
 *
 * @param {Object} drawer - The drawing context or tool.
 */
PathRenderer.prototype.draw = function (drawer) {
  if (!this.showPath) return

  this.updatePath()

  drawer.noFill().stroke(this.color[0], this.color[1], this.color[2])

  for (let i = 1; i < this.path.length; i++) {
    drawer
      .strokeWeight(2)
      .line(this.path[i - 1][0], this.path[i - 1][1], this.path[i][0], this.path[i][1])
  }
}

export default PathRenderer
