import { BoundedQueue } from '../../utilities/BoundedQueue.js'

// Describe the test suite for this module
describe('BoundedQueue Tests', () => {
  let boundedQueue
  const boundValue = 3

  // Use beforeEach for common setup tasks
  beforeEach(() => {
    boundedQueue = BoundedQueue(boundValue)
  })

  // Describe functionality for the basic bounded queue
  describe('Basic BoundedQueue Functionality', () => {
    test('should not exceed the boundValue in size', () => {
      // INIT
      const elementsToAdd = [1, 2, 3, 4]

      // RUN
      elementsToAdd.forEach((element) => boundedQueue.add(element))

      // CHECK RESULTS
      expect(boundedQueue._queue.length).toBeLessThanOrEqual(boundValue)
      expect(boundedQueue._queue).toEqual(expect.arrayContaining([4, 3, 2]))
    })

    test('should not remove elements if the boundValue is not exceeded', () => {
      // INIT
      const elementsToAdd = [1, 2, 3]

      // RUN
      elementsToAdd.forEach((element) => boundedQueue.add(element))

      // CHECK RESULTS
      expect(boundedQueue._queue.length).toBeLessThanOrEqual(boundValue)
      expect(boundedQueue._queue).toEqual(expect.arrayContaining(elementsToAdd))
    })
  })

  describe('BoundedValue property', () => {
    test('should return the bound value', () => {
      expect(boundedQueue.boundValue).toBe(boundValue)
    })

    test('should be read-only', () => {
      expect(() => (boundedQueue.boundValue = 10)).toThrow()
    })
  })

  describe('Queue property', () => {
    test('should return the queue', () => {
      expect(boundedQueue._queue).toEqual([])
    })

    test('should be read-only', () => {
      // INIT
      const elementsToAdd = [1, 2, 3]
      const modifiedQueue = boundedQueue._queue
      modifiedQueue.push(...elementsToAdd)

      // RUN & CHECK RESULTS
      expect(boundedQueue._queue).toEqual([])
      expect(boundedQueue._queue).not.toEqual(modifiedQueue)
      expect(() => (boundedQueue._queue = elementsToAdd)).toThrow()
    })
  })

  // Describe functionality with a custom computeBoundValue function
  describe('BoundedQueue with Custom computeBoundValue', () => {
    let customBoundedQueue
    const computeBoundValue = (queue) => queue.reduce((sum, elem) => sum + elem, 0)

    beforeEach(() => {
      customBoundedQueue = BoundedQueue(6, computeBoundValue) // Bound value is sum of 6
    })

    test('should remove elements based on the custom compute function', () => {
      // INIT
      const elementsToAdd = [1, 2, 3, 4] // Sum is 10

      // RUN
      elementsToAdd.forEach((element) => customBoundedQueue.add(element))

      // CHECK RESULTS
      // The queue should remove elements 1,2 and 3
      expect(computeBoundValue(customBoundedQueue._queue)).toBe(4)
      expect(customBoundedQueue._queue).toEqual([4])
    })

    test('should not remove elements if the custom compute function returns a value below the bound', () => {
      // INIT
      const elementsToAdd = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1] // sum is 0.7, 7 elemnts

      // RUN
      elementsToAdd.forEach((element) => customBoundedQueue.add(element))

      // CHECK RESULTS
      // The queue should not remove any elements
      expect(computeBoundValue(customBoundedQueue._queue)).toBe(0.7)
      expect(customBoundedQueue._queue).toEqual(elementsToAdd)
    })
  })
})
