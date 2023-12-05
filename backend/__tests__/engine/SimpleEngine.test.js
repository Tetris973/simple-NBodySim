import { SimpleEngine, SimpleEngineLibrary } from '#src/engine/SimpleEngine'

/****************************************
 *         SIMPLE ENGINE TESTS          *
 ****************************************/

describe('SimpleEngine Tests', () => {
  let engine

  beforeEach(() => {
    engine = SimpleEngine()
  })

  describe('validate Method', () => {
    test('should throw an error when engine is not ready for validation', () => {
      // INIT
      engine.setTask('exampleTask')

      // ERROR CHECK
      expect(() => {
        engine.validate()
      }).toThrow('Engine not ready: Entities not set')
    })

    test('should validate the engine when ready', () => {
      // INIT
      engine.setTask('exampleTask')
      engine.setEntities([{ mass: 1, position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } }])

      // RUN
      engine.validate()

      // CHECK RESULTS
      expect(engine.isReady).toBe(true)
    })
  })

  describe('isReady Method', () => {
    test('should return success when ready', () => {
      // INIT
      engine.setTask('exampleTask')
      engine.setEntities([{ mass: 1, position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } }])

      // RUN
      const checkStatus = engine.getCheckStatus()

      // CHECK RESULTS
      expect(checkStatus.status).toBe('success')
      expect(checkStatus.details).toBe('Ready')
    })

    test('should return error when not ready', () => {
      // INIT
      engine.setTask('exampleTask')

      // RUN
      const checkStatus = engine.getCheckStatus()

      // CHECK RESULTS
      expect(checkStatus.status).toBe('error')
      expect(checkStatus.details).toContain('Entities not set')
    })
  })

  describe('run Method', () => {
    test('should throw an error when engine is not ready', () => {
      // INIT
      engine.setTask('exampleTask')
      engine.setEntities([])

      // ERROR CHECK
      expect(() => {
        engine.run()
      }).toThrow('Engine not ready, please use validate() method')
    })

    test('should run the engine when ready', () => {
      // INIT
      engine.setTask('exampleTask')
      engine.setEntities([{ mass: 1, position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } }])
      engine.validate()
      const dt = 0.5
      const expectedEntities = [
        { mass: 1 + dt, position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } },
      ]

      // RUN
      const result = engine.run(dt)

      // CHECK RESULTS
      expect(result).toEqual(expectedEntities)
    })
  })
})

/****************************************
 *     SIMPLE ENGINE LIBRARY TESTS      *
 ****************************************/

describe('SimpleEngineLibrary Tests', () => {
  describe('getTask Function', () => {
    test('should retrieve a  task for a valid ID', () => {
      // INIT
      const mockDictionary = {
        task1: { id: 'task1', name: ' Task 1' },
        task2: { id: 'task2', name: ' Task 2' },
      }
      const validId = 'task1'

      // RUN
      const task = SimpleEngineLibrary.getTask(validId, mockDictionary)

      // CHECK RESULTS
      expect(task).toEqual(mockDictionary[validId])
    })

    test('should throw an error for an invalid ID', () => {
      // INIT
      const mockDictionary = {}
      const invalidId = 'invalidTask'

      // ERROR CHECK
      expect(() => {
        SimpleEngineLibrary.getTask(invalidId, mockDictionary)
      }).toThrow('Task not found for ID: ' + invalidId)
    })
  })

  describe('runTick Function', () => {
    test('should process Tick normally when dt is non-zero', () => {
      // INIT
      const task = {
        process: jest.fn().mockReturnValue({ processed: true }),
      }
      const entities = []
      const dt = 0.1
      const negativeDt = -dt

      // RUN
      const result = SimpleEngineLibrary.runTick(task, entities, dt)

      // CHECK RESULTS
      expect(task.process).toHaveBeenCalledWith(entities, dt)
      expect(result).toEqual({ processed: true })

      // RUN WITH NEGATIVE DT
      const negativeResult = SimpleEngineLibrary.runTick(task, entities, negativeDt)

      // CHECK RESULTS
      expect(task.process).toHaveBeenCalledWith(entities, negativeDt)
      expect(negativeResult).toEqual({ processed: true })
    })

    test('should throw an error when dt is 0', () => {
      // INIT
      const task = { process: jest.fn() }
      const entities = []
      const dt = 0

      // ERROR CHECK
      expect(() => {
        SimpleEngineLibrary.runTick(task, entities, dt)
      }).toThrow('dt must be non-zero')
    })
  })
})
