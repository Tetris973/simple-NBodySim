import { TimingManager } from '../../engine/TimingManager'

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
})
