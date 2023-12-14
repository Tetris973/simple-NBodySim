import { Deque } from 'js-sdsl'

const AggregateOperations = {
  addition: {
    aggregate: (aggregate, item) => aggregate + item,
    reverse: (aggregate, item) => aggregate - item,
  },
  multiplication: {
    aggregate: (aggregate, item) => aggregate * item,
    reverse: (aggregate, item) => aggregate / item,
  },
  // More operations can be defined in a similar manner
}

/**
 * Extends a Deque to maintain an aggregate value based on custom item evaluation and aggregation methods.
 */
class BoundedDeque extends Deque {
  /**
   * Creates a FlexibleDeque.
   * @param {number} boundValue - The maximum allowed value for the aggregate.
   * @param {function} itemEvaluator - A function to evaluate the value of each item.
   * @param {function} operation - The aggregation and reverse aggregation operations.
   */
  constructor(boundValue, itemEvaluator = () => 1, operation = AggregateOperations.addition) {
    super()
    this._aggregate = 0
    this._boundValue = boundValue
    this._itemEvaluator = itemEvaluator
    this._aggregateOperation = operation.aggregate
    this._reverseAggregateOperation = operation.reverse
  }

  /**
   * Adds an item to the front of the deque and updates the aggregate.
   * @param {any} item - The item to be added to the front of the deque.
   * @returns {number} The new size of the deque after the item is added.
   * @description This method evaluates the item using the provided itemEvaluator function,
   * then updates the aggregate value using the aggregate operation. If the new aggregate
   * value exceeds the boundValue, it trims the deque from the front until the aggregate
   * value is within the bound.
   */
  pushFront(item) {
    const evaluatedItem = this._itemEvaluator(item)
    this._aggregate = this._aggregateOperation(this._aggregate, evaluatedItem)
    super.pushFront(item)
    while (this._aggregate > this._boundValue) {
      this.popBack()
    }
    return super.size()
  }

  /**
   * Removes and returns the item from the back of the deque, updating the aggregate.
   * @returns {any} The removed item from the back of the deque.
   * @description If the deque is empty, it returns undefined. Otherwise, it removes
   * the item from the back, updates the aggregate value by applying the reverse
   * aggregate operation with the evaluated value of the removed item.
   */
  popBack() {
    if (this.empty()) return
    const back = super.popBack()
    this._aggregate = this._reverseAggregateOperation(this._aggregate, this._itemEvaluator(back))
    return back
  }

  /**
   * Adds an item to the back of the deque and updates the aggregate.
   * @param {any} item - The item to be added to the back of the deque.
   * @returns {number} The new size of the deque after the item is added.
   * @description This method evaluates the item using the provided itemEvaluator function,
   * then updates the aggregate value using the aggregate operation. If the new aggregate
   * value exceeds the boundValue, it trims the deque from the front until the aggregate
   * value is within the bound.
   */
  pushBack(item) {
    const evaluatedItem = this._itemEvaluator(item)
    this._aggregate = this._aggregateOperation(this._aggregate, evaluatedItem)
    super.pushBack(item)
    while (this._aggregate > this._boundValue) {
      this.popFront()
    }
    return super.size()
  }

  /**
   * Removes and returns the item from the front of the deque, updating the aggregate.
   * @returns {any} The removed item from the front of the deque.
   * @description If the deque is empty, it returns undefined. Otherwise, it removes
   * the item from the front, updates the aggregate value by applying the reverse
   * aggregate operation with the evaluated value of the removed item.
   */
  popFront() {
    if (this.empty()) return
    const front = super.popFront()
    this._aggregate = this._reverseAggregateOperation(this._aggregate, this._itemEvaluator(front))
    return front
  }

  /**
   * Gets the current aggregate value.
   * @returns {number} The aggregate value.
   */
  get aggregate() {
    return this._aggregate
  }

  /**
   * Gets the bound value.
   * @returns {number} The bound value.
   */
  get boundValue() {
    return this._boundValue
  }
}

export { BoundedDeque, AggregateOperations }
