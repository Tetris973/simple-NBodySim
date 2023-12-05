// Import the module you are testing
import { StateManager } from '#src/utils/StateManager.js'

// Symbolic states for testing
const TestState = Object.freeze({
  STATE_A: Symbol('state_a'),
  STATE_B: Symbol('state_b'),
  STATE_C: Symbol('state_c'),
  ERROR: Symbol('error'),
})

// Describe the test suite for StateManager
describe('StateManager Tests', () => {
  let stateManager
  let transitions

  // Setup for the tests
  beforeEach(() => {
    transitions = new Map([
      [TestState.STATE_A, [TestState.STATE_B]],
      [TestState.STATE_B, [TestState.STATE_C]],
      [null, [TestState.ERROR]],
      [TestState.ERROR, [TestState.STATE_A]],
    ])
    stateManager = StateManager(TestState.STATE_A, transitions)
  })

  // Test state transitions
  describe('State Transitions', () => {
    test('should allow valid state transition', () => {
      // INIT
      // RUN
      stateManager.transitionTo(TestState.STATE_B)

      // CHECK RESULTS
      expect(stateManager.getCurrentState()).toBe(TestState.STATE_B)
    })

    test('should not allow invalid state transition', () => {
      // CHECK ERROR
      expect(() => {
        stateManager.transitionTo(TestState.STATE_C)
      }).toThrow(
        `Can not transition from ${TestState.STATE_A.description} to ${TestState.STATE_C.description}`
      )
    })

    test('should allow wildcard state transition', () => {
      // INIT
      // RUN & CHECK RESULTS
      stateManager.transitionTo(TestState.ERROR)
      expect(stateManager.getCurrentState()).toBe(TestState.ERROR)

      // RUN & CHECK RESULTS
      stateManager.transitionTo(TestState.STATE_A)
      stateManager.transitionTo(TestState.STATE_B)
      stateManager.transitionTo(TestState.ERROR)
      expect(stateManager.getCurrentState()).toBe(TestState.ERROR)

      // RUN & CHECK RESULTS
      stateManager.transitionTo(TestState.STATE_A)
      stateManager.transitionTo(TestState.STATE_B)
      stateManager.transitionTo(TestState.STATE_C)
      stateManager.transitionTo(TestState.ERROR)
      expect(stateManager.getCurrentState()).toBe(TestState.ERROR)

      // CHECK RESULTS
      expect(() => {
        stateManager.transitionTo(TestState.STATE_C)
      }).toThrow('Can not transition from error to state_c')
    })
  })

  // Test state checking rule creation
  describe('State Checking Rule Creation', () => {
    test('should create a rule that validates current state', () => {
      // RUN
      const isStateBorC = stateManager.createStateCheckRule([TestState.STATE_B, TestState.STATE_C])

      // CHECK RESULTS
      stateManager.transitionTo(TestState.STATE_B)
      expect(isStateBorC()).toBeTruthy()

      stateManager.transitionTo(TestState.STATE_C)
      expect(isStateBorC()).toBeTruthy()
    })

    test('should create a rule that invalidates current state', () => {
      // RUN
      const isStateC = stateManager.createStateCheckRule([TestState.STATE_C])

      // CHECK RESULTS
      expect(isStateC()).toBeFalsy()
    })
  })

  describe('Get Current State', () => {
    test('should return the current state', () => {
      // RUN & CHECK RESULTS
      expect(stateManager.getCurrentState()).toBe(TestState.STATE_A)
    })
  })
})
