import { TimingManager } from '#src/engine/TimingManager'

describe('TimingManager Tests', () => {
  let timingManager
  const maxDeltaTime = (1 / 30) * 1000 // Max delta time in milliseconds

  beforeEach(() => {
    timingManager = TimingManager()
  })

  // Test for calculateDeltaTime
  describe('calculateDeltaTime Method', () => {
    test('should return 0 when recordTick was never called', () => {
      // INIT
      const initialTime = Date.now()

      // RUN
      const deltaTime = timingManager.calculateDeltaTime(initialTime)

      // CHECK RESULTS
      expect(deltaTime).toBe(0)
    })

    test('Should return the difference in time between input of init and current time', () => {
      // INIT
      const initialTime = Date.now()
      timingManager.init(initialTime)
      const laterTime = initialTime + 10

      // RUN
      const deltaTime = timingManager.calculateDeltaTime(laterTime)

      // CHECK RESULTS
      expect(deltaTime).toBe(10)
    })

    test('should return maxDeltaTime when laterTime if over upper bound', () => {
      // INIT
      const initialTime = Date.now()
      timingManager.init(initialTime)
      const laterTime = initialTime + 50

      // RUN
      const deltaTime = timingManager.calculateDeltaTime(laterTime)

      // CHECK RESULTS
      expect(deltaTime).toBe(maxDeltaTime)
    })

    test('should throw error when calculating delta time with input time before last run', () => {
      // INIT
      const initialTime = Date.now()
      timingManager.init(initialTime)
      const earlierTime = initialTime - 10 // 10 milliseconds earlier

      // ERROR CHECK
      expect(() => {
        timingManager.calculateDeltaTime(earlierTime)
      }).toThrow(
        `Current time(${earlierTime}) must be equal to or greater than the last recorded time(${initialTime}).`
      )
    })
  })

  // Test for incrementTicks
  describe('recordTick Method', () => {
    // Test for correct tick increment
    test('should correctly increment ticks', () => {
      // INIT
      const time = Date.now()
      timingManager.init(time)

      // RUN
      // Simulate running two ticks
      timingManager.recordTick(time)
      timingManager.recordTick(time)

      // CHECK RESULTS
      expect(timingManager.ticks).toBe(2)
    })

    test('should throw error when adding tick before init', () => {
      // INIT
      const time = Date.now()

      // ERROR CHECK
      expect(() => {
        timingManager.recordTick(time)
      }).toThrow('You must call init before calling recordTick.')
    })
  })

  describe('isUpdateNeeded Method', () => {
    test('should return true when last update is null', () => {
      // INIT
      const time = Date.now()
      timingManager.init(time)

      // RUN
      const isUpdateNeeded = timingManager.isUpdateNeeded(time)

      // CHECK RESULTS
      expect(isUpdateNeeded).toBe(true)
    })

    test('should return true when last update is over 16.6 ms ago', () => {
      // INIT
      const time = Date.now()
      timingManager.init(time)
      const laterTime = time + 16.6

      // RUN
      const isUpdateNeeded = timingManager.isUpdateNeeded(laterTime)

      // CHECK RESULTS
      expect(isUpdateNeeded).toBe(true)
    })

    test('should return false when last update is under 16.6 ms ago', () => {
      // INIT
      const time = Date.now()
      timingManager.init(time)
      timingManager.recordUpdate(time)
      const laterTime = time + 16.5

      // RUN
      const isUpdateNeeded = timingManager.isUpdateNeeded(laterTime)

      // CHECK RESULTS
      expect(isUpdateNeeded).toBe(false)
    })

    test('should throw error when input time is before last update', () => {
      // INIT
      const time = Date.now()
      timingManager.init(time)
      timingManager.recordUpdate(time)
      const earlierTime = time - 10

      // ERROR CHECK
      expect(() => {
        timingManager.isUpdateNeeded(earlierTime)
      }).toThrow(
        `Current time(${earlierTime}) must be equal to or greater than the last recorded time(${time}).`
      )
    })
  })

  describe('meanTickTime Property', () => {
    test('should return 0 when no ticks have been processed', () => {
      // INIT

      // RUN
      const meanTickTime = timingManager.meanTickTime

      // CHECK RESULTS
      expect(meanTickTime).toBe(0)
    })
    test('should return correct mean tick time', () => {
      // INIT
      const time1 = Date.now()
      timingManager.init(time1)
      const delay1 = 40 // 40ms delay for first tick
      const time2 = time1 + delay1
      const delay2 = 60 // 60ms delay for second tick
      const time3 = time2 + delay2

      // Simulate running two ticks with different delays
      timingManager.recordTick(time2)
      timingManager.recordTick(time3)

      // RUN
      const meanTickTime = timingManager.meanTickTime

      // CHECK RESULTS
      expect(meanTickTime).toBe((delay1 + delay2) / 2)
    })
  })
  describe('lastTickTime Property', () => {
    test('should return 0 when no ticks have been processed', () => {
      // INIT

      // RUN
      const lastTickTime = timingManager.lastTickTime

      // CHECK RESULTS
      expect(lastTickTime).toBe(0)
    })
    test('should return correct last tick time', () => {
      // INIT
      const time1 = Date.now()
      timingManager.init(time1)
      const delay1 = 40 // 40ms delay for first tick
      const time2 = time1 + delay1
      const delay2 = 60 // 60ms delay for second tick
      const time3 = time2 + delay2

      // Simulate running two ticks with different delays
      timingManager.recordTick(time1)
      timingManager.recordTick(time2)
      timingManager.recordTick(time3)

      // RUN
      const lastTickTime = timingManager.lastTickTime

      // CHECK RESULTS
      expect(lastTickTime).toBe(delay2)
    })
  })

  describe('tickPerSecond Property', () => {
    test('should return 0 when no ticks have been processed', () => {
      // INIT

      // RUN
      const tickPerSecond = timingManager.tickPerSecond

      // CHECK RESULTS
      expect(tickPerSecond).toBe(0)
    })
    test('should accurately calculate ticks per second', () => {
      // INIT
      const totalTimeMs = 1500 // 1.5 seconds
      const totalTicks = 45 // 45 ticks in 1.5 seconds

      const startTime = Date.now()
      timingManager.init(startTime)

      for (let i = 0; i < totalTicks; i++) {
        const tickTime = startTime + i * (totalTimeMs / totalTicks)
        timingManager.recordTick(tickTime)
      }

      const expectedTicksPerSecond = totalTicks / (totalTimeMs / 1000)

      // RUN
      const actualTicksPerSecond = timingManager.tickPerSecond

      // CHECK RESULTS
      expect(actualTicksPerSecond).toBeCloseTo(expectedTicksPerSecond, 1)
    })
  })

  describe('updateRate Property', () => {
    test('should return 60 by default', () => {
      // INIT

      // RUN
      const updateRate = timingManager.updateRate

      // CHECK RESULTS
      expect(updateRate).toBe(60)
    })
    test('should be readOnly', () => {
      // INIT
      const updateRate = 60

      // ERROR CHECK
      expect(() => {
        timingManager.updateRate = updateRate
      }).toThrow('Cannot set property updateRate of #<Object> which has only a getter')
    })
  })

  describe('updatePerSecond Property', () => {
    test('should return 0 when no updates have been processed', () => {
      // INIT

      // RUN
      const updatePerSecond = timingManager.updatePerSecond

      // CHECK RESULTS
      expect(updatePerSecond).toBe(0)
    })
    test('should accurately calculate updates per second', () => {
      // INIT
      const totalTimeMs = 1500 // 1.5 seconds
      const totalUpdates = 45 // 45 updates in 1.5 seconds

      const startTime = Date.now()
      timingManager.init(startTime)

      for (let i = 0; i < totalUpdates; i++) {
        const updateTime = startTime + i * (totalTimeMs / totalUpdates)
        timingManager.recordUpdate(updateTime)
      }

      const expectedUpdatesPerSecond = totalUpdates / (totalTimeMs / 1000)

      // RUN
      const actualUpdatesPerSecond = timingManager.updatePerSecond

      // CHECK RESULTS
      expect(actualUpdatesPerSecond).toBeCloseTo(expectedUpdatesPerSecond, 1)
    })
  })

  describe('meanUpdateTime Property', () => {
    test('should return 0 when no updates have been processed', () => {
      // INIT

      // RUN
      const meanUpdateTime = timingManager.meanUpdateTime

      // CHECK RESULTS
      expect(meanUpdateTime).toBe(0)
    })
    test('should return correct mean update time', () => {
      // INIT
      const time1 = Date.now()
      timingManager.init(time1)
      timingManager.recordUpdate(time1)
      const delay1 = 40 // 40ms delay for first update
      const time2 = time1 + delay1
      const delay2 = 60 // 60ms delay for second update
      const time3 = time2 + delay2

      // Simulate running two updates with different delays
      timingManager.recordUpdate(time2)
      timingManager.recordUpdate(time3)

      // RUN
      const meanUpdateTime = timingManager.meanUpdateTime

      // CHECK RESULTS
      expect(meanUpdateTime).toBe((delay1 + delay2) / 2)
    })
  })

  describe('timeScaleFactor property', () => {
    test('should return 1 by default', () => {
      // INIT

      // RUN
      const timeScaleFactor = timingManager.timeScaleFactor

      // CHECK RESULTS
      expect(timeScaleFactor).toBe(1)
    })
    test('should return correct time scale factor', () => {
      // INIT
      const timeScaleFactor = 2
      timingManager.timeScaleFactor = timeScaleFactor

      // RUN
      const actualTimeScaleFactor = timingManager.timeScaleFactor

      // CHECK RESULTS
      expect(actualTimeScaleFactor).toBe(timeScaleFactor)
    })
    test('should return correct dt multiplied by time scale factor', () => {
      // INIT
      const timeScaleFactor = 2
      timingManager.timeScaleFactor = timeScaleFactor
      const time = Date.now()
      timingManager.init(time)
      const deltaTime = 10

      // RUN
      const actualDeltaTime = timingManager.calculateDeltaTime(time + deltaTime)

      // CHECK RESULTS
      expect(actualDeltaTime).toBe(deltaTime * timeScaleFactor)
    })
    test('should throw error when setting time scale factor inferior to 1', () => {
      // INIT
      const timeScaleFactor = 0.5

      // ERROR CHECK
      expect(() => {
        timingManager.timeScaleFactor = timeScaleFactor
      }).toThrow('Time scale factor must be greater than or equal to 1.')
    })
  })
})
