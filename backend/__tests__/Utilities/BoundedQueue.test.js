import { BoundedQueue } from '#src/utils/BoundedQueue.js'

// Describe the test suite for this module
describe('BoundedQueue Tests', () => {
  let boundedQueue
  const boundValue = 3

  beforeEach(() => {
    boundedQueue = BoundedQueue(boundValue)
  })

  describe('enqueue function', () => {
    test('should not exceed the boundValue in size', () => {
      const elementsToAdd = [1, 2, 3, 4]

      elementsToAdd.forEach((element) => boundedQueue.enqueue(element))

      expect(boundedQueue.items.length).toBeLessThanOrEqual(boundValue)
      expect(boundedQueue.items).toEqual(expect.arrayContaining([4, 3, 2]))
    })

    test('should not remove elements if the boundValue is not exceeded', () => {
      const elementsToAdd = [1, 2, 3]

      elementsToAdd.forEach((element) => boundedQueue.enqueue(element))

      expect(boundedQueue.items.length).toBeLessThanOrEqual(boundValue)
      expect(boundedQueue.items).toEqual(expect.arrayContaining(elementsToAdd))
    })
  })

  describe('dequeue function', () => {
    beforeEach(() => {
      boundedQueue.enqueue(1)
      boundedQueue.enqueue(2)
    })

    test('should remove and return the oldest element', () => {
      const dequeuedElement = boundedQueue.dequeue()

      expect(dequeuedElement).toBe(1)
      expect(boundedQueue.items).toEqual(expect.arrayContaining([2]))
    })

    test('should throw an error if the queue is empty', () => {
      boundedQueue.clear()

      expect(() => boundedQueue.dequeue()).toThrow()
    })
  })

  describe('peek function', () => {
    beforeEach(() => {
      boundedQueue.enqueue(1)
      boundedQueue.enqueue(2)
    })

    test('should return the front element without removing it', () => {
      const frontElement = boundedQueue.peek()

      expect(frontElement).toBe(1)
      expect(boundedQueue.items.length).toBe(2)
    })

    test('should return null if the queue is empty', () => {
      boundedQueue.clear()

      expect(boundedQueue.peek()).toBe(null)
    })
  })

  describe('last function', () => {
    beforeEach(() => {
      boundedQueue.enqueue(1)
      boundedQueue.enqueue(2)
    })

    test('should return the last element without removing it', () => {
      const lastElement = boundedQueue.last()

      expect(lastElement).toBe(2)
      expect(boundedQueue.items.length).toBe(2)
    })

    test('should return null if the queue is empty', () => {
      boundedQueue.clear()

      expect(boundedQueue.last()).toBe(null)
    })
  })

  describe('isEmpty function', () => {
    test('should return true for an empty queue and false otherwise', () => {
      expect(boundedQueue.isEmpty()).toBe(true)

      boundedQueue.enqueue(1)

      expect(boundedQueue.isEmpty()).toBe(false)
    })
  })

  describe('clear function', () => {
    beforeEach(() => {
      boundedQueue.enqueue(1)
      boundedQueue.enqueue(2)
    })

    test('should empty the queue', () => {
      boundedQueue.clear()

      expect(boundedQueue.items.length).toBe(0)
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
      expect(boundedQueue.items).toEqual([])
    })

    test('should be read-only', () => {
      // INIT
      const elementsToAdd = [1, 2, 3]
      const modifiedQueue = boundedQueue.items
      modifiedQueue.push(...elementsToAdd)

      // RUN & CHECK RESULTS
      expect(boundedQueue.items).toEqual([])
      expect(boundedQueue.items).not.toEqual(modifiedQueue)
      expect(() => (boundedQueue.items = elementsToAdd)).toThrow()
    })
  })

  describe('boundValue property', () => {
    test('should return the bound value', () => {
      expect(boundedQueue.boundValue).toBe(boundValue)
    })

    test('should be read-only', () => {
      expect(() => (boundedQueue.boundValue = 10)).toThrow()
    })
  })

  describe('length property', () => {
    test('should return the correct number of items in the queue', () => {
      expect(boundedQueue.length).toBe(0)

      boundedQueue.enqueue(1)
      boundedQueue.enqueue(2)

      expect(boundedQueue.length).toBe(2)
    })
  })

  // Describe functionality with a custom computeBoundValue function
  describe('BoundedQueue with Custom computeBoundValue', () => {
    let customBoundedQueue
    const computeBoundValue = (items) => items.reduce((sum, elem) => sum + elem, 0)

    beforeEach(() => {
      customBoundedQueue = BoundedQueue(6, computeBoundValue) // Bound value is sum of 6
    })

    test('should remove elements based on the custom compute function', () => {
      // INIT
      const elementsToAdd = [1, 2, 3, 4] // Sum is 10

      // RUN
      elementsToAdd.forEach((element) => customBoundedQueue.enqueue(element))

      // CHECK RESULTS
      // The queue should remove elements 1,2 and 3
      expect(computeBoundValue(customBoundedQueue.items)).toBe(4)
      expect(customBoundedQueue.items).toEqual([4])
    })

    test('should not remove elements if the custom compute function returns a value below the bound', () => {
      // INIT
      const elementsToAdd = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1] // sum is 0.7, 7 elemnts

      // RUN
      elementsToAdd.forEach((element) => customBoundedQueue.enqueue(element))

      // CHECK RESULTS
      // The queue should not remove any elements
      expect(computeBoundValue(customBoundedQueue.items)).toBe(0.7)
      expect(customBoundedQueue.items).toEqual(elementsToAdd)
    })
  })
})
