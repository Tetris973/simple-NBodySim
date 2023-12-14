/**
 * Creates a StateManager object.
 * @param {Symbol} initialState - The initial state of the module.
 * @param {Map<Symbol, Symbol[]>} transitions - Map of states to their valid next states.
 */
const StateManager = (initialState, transitions) => {
  /****************************************
   *         PRIVATE VARIABLES           *
   ****************************************/

  /**
   * The current state.
   */
  let _currentState = initialState

  /**
   * Map of states to their valid next states.
   * @type {Map<Symbol, Symbol[]>}
   */
  const _validTransitions = transitions

  /****************************************
   *          PUBLIC FUNCTIONS           *
   ****************************************/
  const obj = {}

  /**
   * Checks if a transition to a new state is valid.
   * null represents any state.
   * @param {Symbol} newState - The state to transition to.
   * @returns {boolean} True if the transition is valid.
   */
  obj.canTransitionTo = (newState) => {
    const allowedTransitions = _validTransitions.get(_currentState) || []
    const wildcardTransitions = _validTransitions.get(null) || []
    return allowedTransitions.includes(newState) || wildcardTransitions.includes(newState)
  }

  /**
   * Transitions to a new state if the transition is valid.
   * @param {Symbol} newState - The state to transition to.
   * @returns {boolean} True if the transition was successful.
   */
  obj.transitionTo = (newState) => {
    if (!obj.canTransitionTo(newState)) {
      throw new Error(
        `Can not transition from ${_currentState.description} to ${newState.description}`
      )
    }
    _currentState = newState
  }

  /**
   * Creates a rule for state checking.
   * @param {Symbol[]} allowedStates - Array of states to be included in the check.
   * @returns {Function} A function that checks if the current state is included in the allowed states.
   */
  obj.createStateCheckRule = (allowedStates) => {
    return () => allowedStates.includes(_currentState)
  }

  /**
   * Gets the current state.
   * @returns {Symbol} The current state.
   */
  obj.getCurrentState = () => _currentState

  return obj
}

export { StateManager }
