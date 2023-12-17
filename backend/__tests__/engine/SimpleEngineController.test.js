import { SimpleEngineController } from '#src/engine/SimpleEngineController.js'
import { Worker } from 'worker_threads'

// Describe the test suite for this module
describe('SimpleEngineController Tests', () => {
  let controller
  let mockWorker
  let dummyWorker

  beforeEach(async () => {
    mockWorker = new Worker('./src/engine/SimpleEngineWorker')
    controller = await SimpleEngineController(mockWorker)
    dummyWorker = new Worker('./__tests__/engine/tests_utils/dummyWorker.js')
  })

  afterEach(() => {
    controller.terminate()
    dummyWorker.terminate()
  })

  describe('Constructor', () => {
    test('should correctly instantiate when given a correct worker', async () => {
      // INIT

      // RUN
      const instance = await SimpleEngineController(mockWorker)

      // CHECK RESULTS
      expect(instance).toBeDefined()
      expect(instance.isTerminated).toBe(false)
    })

    test('should throw error when the worker is not of the correct type', async () => {
      // INIT

      // ERROR CHECK
      await expect(SimpleEngineController(dummyWorker)).rejects.toThrow(
        'Provided worker is not of the correct type.'
      )
    })
  })

  describe('Complete Workflow', () => {
    test('should correctly handle the complete workflow', async () => {
      // INIT
      const entities = [{ mass: 0 }]
      const taskId = 'exampleTask'
      const engineDataCallback = jest.fn().mockReturnValue({ processed: true })
      controller.onEngineData(engineDataCallback)

      // RUN
      await controller.init()
      await controller.setTask(taskId)
      await controller.setEntities(entities)
      await controller.setTimeScaleFactor(1000)
      await controller.validate()
      await controller.start()
      await controller.stop()
      await new Promise((resolve) => setTimeout(resolve, 200))

      // CHECK RESULTS
      await controller.stop()
      const engineInfos = await controller.getEngineInfos()
      expect(engineInfos).toHaveProperty('currentState', 'ready')
      expect(engineInfos).toHaveProperty('lastTickTime', expect.any(Number))
      expect(engineInfos).toHaveProperty('tickPerSecond', expect.any(Number))
      expect(engineInfos).toHaveProperty('meanTickTime', expect.any(Number))
      expect(engineInfos).toHaveProperty('tickCount', expect.any(Number))
      expect(engineInfos).toHaveProperty('timeScaleFactor', 1000)
      // TOTO: be able to test the engineDataCallback
    })
  })

  describe('After Termination', () => {
    test('should throw error on method calls after the worker is terminated', async () => {
      // INIT
      controller.terminate()

      // ERROR CHECK
      expect(() => controller.init()).toThrow('Worker is terminated')
      expect(() => controller.validate()).toThrow('Worker is terminated')
      expect(() => controller.start()).toThrow('Worker is terminated')
      expect(() => controller.stop()).toThrow('Worker is terminated')
      expect(() => controller.setTask('exampleTask')).toThrow('Worker is terminated')
      expect(() => controller.setEntities([])).toThrow('Worker is terminated')
      expect(() => controller.setTimeScaleFactor(1)).toThrow('Worker is terminated')
      expect(() => controller.getEngineInfos()).toThrow('Worker is terminated')
    })
  })

  describe('isTerminated property', () => {
    test('should return correct status', () => {
      // INIT
      expect(controller.isTerminated).toBe(false)

      // RUN
      controller.terminate()

      // CHECK RESULTS
      expect(controller.isTerminated).toBe(true)
    })
  })
})
