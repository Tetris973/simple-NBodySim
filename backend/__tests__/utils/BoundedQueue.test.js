import { BoundedDeque, AggregateOperations } from '#src/utils/BoundedDeque.js'

describe('BoundedDeque Tests', () => {
  let boundedDeque
  const boundValue = 4

  beforeEach(() => {
    boundedDeque = new BoundedDeque(boundValue)
  })

  describe('pushFront method', () => {
    describe('default behavior', () => {
      test('should add an item to the front of the deque', () => {
        // INIT
        const item = 1
        boundedDeque.pushFront(9)

        // RUN
        boundedDeque.pushFront(item)

        // CHECK RESULTS
        expect(boundedDeque.popFront()).toBe(item)
      })

      test('should return the new size of the deque', () => {
        expect(boundedDeque.pushFront(1)).toBe(1)
      })

      test('should remove items from the back of the queue if number of items exceeds bound', () => {
        // INIT
        const elementsToAdd = [1, 2, 3, 4, 5, 6]

        // RUN
        elementsToAdd.forEach((element) => boundedDeque.pushFront(element))

        // CHECK RESULTS
        expect(Array.from(boundedDeque)).toEqual([6, 5, 4, 3])
      })
    })

    describe('with itemEvaluator', () => {
      const itemEvaluator = jest.fn(() => 2)

      beforeEach(() => {
        boundedDeque = new BoundedDeque(boundValue, itemEvaluator)
      })

      test('should evaluate the item using the provided itemEvaluator function', () => {
        // INIT
        const player1 = { player: 'player1', score: 10 }
        const player2 = { player: 'player2', score: 20 }
        const player3 = { player: 'player3', score: 30 }
        const player4 = { player: 'player4', score: 40 }

        // RUN
        boundedDeque.pushFront(player1)
        boundedDeque.pushFront(player2)
        boundedDeque.pushFront(player3)
        boundedDeque.pushFront(player4)

        // CHECK RESULTS
        expect(Array.from(boundedDeque)).toEqual([player4, player3])
        expect(boundedDeque.aggregate).toBe(4)
      })
    })

    describe('with aggregateOperation', () => {
      beforeEach(() => {
        boundedDeque = new BoundedDeque(boundValue, (item) => item, AggregateOperations.addition)
      })

      test('should update the aggregate value and remove items using the aggregate operation', () => {
        // INIT
        const elementsToAdd = [1, 1, 1, 1, 1.5, 2]

        // RUN
        elementsToAdd.forEach((element) => boundedDeque.pushFront(element))

        // CHECK RESULTS
        expect(Array.from(boundedDeque)).toEqual([2, 1.5])
        expect(boundedDeque.aggregate).toBe(3.5)
      })
    })
  })

  describe('popBack method', () => {
    describe('default behavior', () => {
      test('should remove an item from the back of the deque', () => {
        // INIT
        const frontItem = 1
        const backItem = 9
        boundedDeque.pushFront(backItem)
        boundedDeque.pushFront(frontItem)

        // RUN
        const poppedItem = boundedDeque.popBack()

        // CHECK RESULTS
        expect(poppedItem).toBe(backItem)
      })

      test('should return undefined if the deque is empty', () => {
        expect(boundedDeque.popBack()).toBeUndefined()
      })

      test('should update the aggregate value', () => {
        // INIT
        const elementsToAdd = [1, 2, 3, 4]
        elementsToAdd.forEach((element) => boundedDeque.pushFront(element))

        // RUN
        boundedDeque.popBack()

        // CHECK RESULTS
        expect(boundedDeque.aggregate).toBe(3)
      })
    })

    describe('with itemEvaluator', () => {
      const itemEvaluator = jest.fn(() => 0.7)

      beforeEach(() => {
        boundedDeque = new BoundedDeque(boundValue, itemEvaluator)
      })

      test('should evaluate the item using the provided itemEvaluator function', () => {
        // INIT
        const player1 = { player: 'player1', score: 10 }
        const player2 = { player: 'player2', score: 20 }
        const player3 = { player: 'player3', score: 30 }
        boundedDeque.pushFront(player1)
        boundedDeque.pushFront(player2)
        boundedDeque.pushFront(player3)

        // RUN
        boundedDeque.popBack()

        // CHECK RESULTS
        expect(boundedDeque.aggregate).toBeCloseTo(1.4)
      })
    })

    describe('with reverseAggregateOperation', () => {
      beforeEach(() => {
        boundedDeque = new BoundedDeque(boundValue, (item) => item, AggregateOperations.addition)
      })

      test('should update the aggregate value using the reverse aggregate operation', () => {
        // INIT
        const elementsToAdd = [1.5, 2]
        elementsToAdd.forEach((element) => boundedDeque.pushFront(element))

        // RUN
        boundedDeque.popBack()

        // CHECK RESULTS
        expect(boundedDeque.aggregate).toBe(2)
      })
    })
  })

  describe('pushBack method', () => {
    describe('default behavior', () => {
      test('should add an item to the back of the deque', () => {
        // INIT
        const item = 1
        boundedDeque.pushFront(9)

        // RUN
        boundedDeque.pushBack(item)

        // CHECK RESULTS
        expect(boundedDeque.popBack()).toBe(item)
      })

      test('should return the new size of the deque', () => {
        expect(boundedDeque.pushBack(1)).toBe(1)
      })

      test('should remove items from the front of the queue if number of items exceeds bound', () => {
        // INIT
        const elementsToAdd = [1, 2, 3, 4, 5, 6]

        // RUN
        elementsToAdd.forEach((element) => boundedDeque.pushBack(element))

        // CHECK RESULTS
        expect(Array.from(boundedDeque)).toEqual([3, 4, 5, 6])
      })
    })

    describe('with itemEvaluator', () => {
      const itemEvaluator = jest.fn(() => 2)

      beforeEach(() => {
        boundedDeque = new BoundedDeque(boundValue, itemEvaluator)
      })

      test('should evaluate the item using the provided itemEvaluator function', () => {
        // INIT
        const player1 = { player: 'player1', score: 10 }
        const player2 = { player: 'player2', score: 20 }
        const player3 = { player: 'player3', score: 30 }
        const player4 = { player: 'player4', score: 40 }

        // RUN
        boundedDeque.pushBack(player1)
        boundedDeque.pushBack(player2)
        boundedDeque.pushBack(player3)
        boundedDeque.pushBack(player4)

        // CHECK RESULTS
        expect(Array.from(boundedDeque)).toEqual([player3, player4])
        expect(boundedDeque.aggregate).toBe(4)
      })
    })

    describe('with aggregateOperation', () => {
      beforeEach(() => {
        boundedDeque = new BoundedDeque(boundValue, (item) => item, AggregateOperations.addition)
      })

      test('should update the aggregate value and remove items using the aggregate operation', () => {
        // INIT
        const elementsToAdd = [1, 1, 1, 1, 1.5, 2]

        // RUN
        elementsToAdd.forEach((element) => boundedDeque.pushBack(element))

        // CHECK RESULTS
        expect(Array.from(boundedDeque)).toEqual([1.5, 2])
        expect(boundedDeque.aggregate).toBe(3.5)
      })
    })
  })

  describe('popFront method', () => {
    describe('default behavior', () => {
      test('should remove an item from the front of the deque', () => {
        // INIT
        const frontItem = 1
        const backItem = 9
        boundedDeque.pushFront(backItem)
        boundedDeque.pushFront(frontItem)

        // RUN
        const poppedItem = boundedDeque.popFront()

        // CHECK RESULTS
        expect(poppedItem).toBe(frontItem)
      })

      test('should return undefined if the deque is empty', () => {
        expect(boundedDeque.popFront()).toBeUndefined()
      })

      test('should update the aggregate value', () => {
        // INIT
        const elementsToAdd = [1, 2, 3, 4]
        elementsToAdd.forEach((element) => boundedDeque.pushFront(element))

        // RUN
        boundedDeque.popFront()

        // CHECK RESULTS
        expect(boundedDeque.aggregate).toBe(3)
      })
    })

    describe('with itemEvaluator', () => {
      const itemEvaluator = jest.fn(() => 0.7)

      beforeEach(() => {
        boundedDeque = new BoundedDeque(boundValue, itemEvaluator)
      })

      test('should evaluate the item using the provided itemEvaluator function', () => {
        // INIT
        const player1 = { player: 'player1', score: 10 }
        const player2 = { player: 'player2', score: 20 }
        const player3 = { player: 'player3', score: 30 }
        boundedDeque.pushFront(player1)
        boundedDeque.pushFront(player2)
        boundedDeque.pushFront(player3)

        // RUN
        boundedDeque.popFront()

        // CHECK RESULTS
        expect(boundedDeque.aggregate).toBeCloseTo(1.4)
      })
    })

    describe('with reverseAggregateOperation', () => {
      beforeEach(() => {
        boundedDeque = new BoundedDeque(boundValue, (item) => item, AggregateOperations.addition)
      })

      test('should update the aggregate value using the reverse aggregate operation', () => {
        // INIT
        const elementsToAdd = [1.5, 2]
        elementsToAdd.forEach((element) => boundedDeque.pushFront(element))

        // RUN
        boundedDeque.popFront()

        // CHECK RESULTS
        expect(boundedDeque.aggregate).toBe(1.5)
      })
    })
  })

  describe('boundValue property', () => {
    test('should return the bound value', () => {
      expect(boundedDeque.boundValue).toBe(boundValue)
    })

    test('should be read-only', () => {
      expect(() => (boundedDeque.boundValue = 10)).toThrow()
    })
  })

  describe('aggregate property', () => {
    test('should return the aggregate value', () => {
      expect(boundedDeque.aggregate).toBe(0)
    })

    test('should be read-only', () => {
      expect(() => (boundedDeque.aggregate = 10)).toThrow()
    })
  })
})
