import { Task } from '../../../Task.js'
import { exampleTask } from './exampleTask.js'
import { nBodyVerlet } from './nBodyVerlet.js'

/**
 * Sets up a Task object using the provided force computation object.
 * @function setupTask
 * @param {Object} force - Object containing a compute function and its metadata.
 * @returns {Task} Configured Task object.
 */
const setupTask = (force) => {
  const task = Task(force.id, force.function)
  task.title = force.title
  task.description = force.description
  return task
}

/**
 * Dictionary of pre-instantiated tasks.
 * @type {Object}
 */
const tasks = {
  [exampleTask.id]: setupTask(exampleTask),
  [nBodyVerlet.id]: setupTask(nBodyVerlet),
  // Add more pre-instantiated tasks as needed
}

export { tasks as forcesDictionnary }
