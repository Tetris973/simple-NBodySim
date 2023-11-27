import { Float64StructArray } from '../../utilities/Float64StructArray.js'
import * as lib from '../../utilities/Float64StructArrayLibrary.js'

describe('Float64StructArray Constructor Tests', () => {
  // Test 1: Initialize an Array Correctly
  test('should initialize an array correctly with valid input', () => {
    /* INIT */
    const structSize = 4
    const nbStruct = 3

    /* RUN */
    const array = Float64StructArray(structSize, nbStruct)

    /* CHECKS RESULTS */
    expect(array instanceof Float64Array).toBe(true)
    expect(array.length).toBe((structSize + lib.NB_STRUCT_FLAGS) * nbStruct + lib.NB_ARRAY_FLAGS)
    expect(array[0]).toBe(lib.Flags.END)
    expect(array.structSize).toBe(structSize)
    expect(array.nbCurrentStruct).toBe(0)
    expect(array.nbMaxStruct).toBe(nbStruct)
    expect(array.lastIndex).toBe(0)
    expect(array.nbToDelete).toBe(0)
  })

  // Test 2: Throw an Error for Invalid structSize
  test('should throw an error for invalid structSize', () => {
    /* INIT */
    const structSize = -1
    const nbStruct = 3

    /* ERROR CHECK */
    expect(() => Float64StructArray(structSize, nbStruct)).toThrow(
      'structSize should be a positive integer.'
    )
  })

  // Test 3: Throw an Error for Invalid nbStruct
  test('should throw an error for invalid nbStruct', () => {
    /* INIT */
    const structSize = 4
    const nbStruct = -1

    /* ERROR CHECK */
    expect(() => Float64StructArray(structSize, nbStruct)).toThrow(
      'nbStruct should be a positive integer.'
    )
  })

  // Additional tests for Float64StructArray Constructor

  // Test 4: Throw an Error for Non-Integer structSize
  test('should throw an error for non-integer structSize', () => {
    /* INIT */
    const structSize = 4.5
    const nbStruct = 3

    /* ERROR CHECK */
    expect(() => Float64StructArray(structSize, nbStruct)).toThrow(
      'structSize should be a positive integer.'
    )
  })

  // Test 5: Throw an Error for Non-Integer nbStruct
  test('should throw an error for non-integer nbStruct', () => {
    /* INIT */
    const structSize = 4
    const nbStruct = 3.5

    /* ERROR CHECK */
    expect(() => Float64StructArray(structSize, nbStruct)).toThrow(
      'nbStruct should be a positive integer.'
    )
  })

  // Test 6: Handle a Large Number of Structs
  test('should be able to handle a large number of structs', () => {
    /* INIT */
    const structSize = 4
    const nbStruct = 1_000_000

    /* RUN */
    const array = Float64StructArray(structSize, nbStruct)

    /* CHECKS RESULTS */
    expect(array.length).toBe((structSize + lib.NB_STRUCT_FLAGS) * nbStruct + lib.NB_ARRAY_FLAGS)
  })
})

describe('Float64StructArray expand Function Tests', () => {
  // Test 1: Expanding Array Increases Its Length Correctly
  test('expanding array increases its length correctly', () => {
    /* INIT */
    const structSize = 4
    const nbStruct = 3
    const nbStructToAdd = 2
    const array = Float64StructArray(structSize, nbStruct)

    /* RUN */
    const expandedArray = lib.expand(array, nbStructToAdd, Float64StructArray)

    /* CHECKS RESULTS */
    const expectedLength =
      (structSize + lib.NB_STRUCT_FLAGS) * (nbStruct + nbStructToAdd) + lib.NB_ARRAY_FLAGS
    expect(expandedArray.length).toBe(expectedLength)
    expect(expandedArray.nbMaxStruct).toBe(nbStruct + nbStructToAdd)
  })

  // Test 2: Expanding Array with Invalid Struct Number
  test('expanding array with invalid struct number', () => {
    /* INIT */
    const structSize = 4
    const nbStruct = 3
    const array = Float64StructArray(structSize, nbStruct)

    /* ERROR CHECK */
    expect(() => lib.expand(array, -1)).toThrow('nbStructToAdd should be a positive integer.')
  })

  // Test 3: Expanding Array Copies Existing Data Correctly
  test('expanding array copies existing data correctly, lastIndex is correct', () => {
    /* INIT */
    const structSize = 2
    const nbStruct = 2
    const nbStructToAdd = 1
    const array = Float64StructArray(structSize, nbStruct)

    // Setting some data
    array[1] = 42
    array[2] = 24

    /* RUN */
    const expandedArray = lib.expand(array, nbStructToAdd, Float64StructArray)

    /* CHECKS RESULTS */
    expect(expandedArray[expandedArray.lastIndex]).toBe(lib.Flags.END)
    expect(expandedArray[1]).toBe(42)
    expect(expandedArray[2]).toBe(24)
  })
})

describe('Float64StructArray addStruct Function Tests', () => {
  // Test 1: Add a Struct with No Data
  test('should add a struct with no data', () => {
    /* INIT */
    const structSize = 3
    const nbStruct = 2
    const array = Float64StructArray(structSize, nbStruct)

    /* RUN */
    const index = lib.addStruct(array)

    /* CHECKS RESULTS */
    expect(index).toBe(0)
    for (let i = 0; i < structSize; i++) {
      expect(array[lib.getStartIndex(array, index) + i]).toBe(0)
    }
    expect(array[lib.getStartIndex(array, index) - 1]).toBe(lib.Flags.ACTIVE)
    expect(array[lib.getStartIndex(array, index) + structSize]).toBe(lib.Flags.END)
    expect(array.lastIndex).toBe(lib.getStartIndex(array, index) + structSize)
  })

  // Test 2: Add a Struct with Data
  test('should add a struct with data', () => {
    /* INIT */
    const structSize = 3
    const nbStruct = 2
    const array = Float64StructArray(structSize, nbStruct)
    const data = [1.5, -2.3, 0]

    /* RUN */
    const index = lib.addStruct(array, data)

    /* CHECKS RESULTS */
    expect(lib.getStartIndex(array, index)).toBe(1)
    for (let i = 0; i < structSize; i++) {
      expect(array[lib.getStartIndex(array, index) + i]).toBe(data[i])
    }
    expect(array[lib.getStartIndex(array, index) - 1]).toBe(lib.Flags.ACTIVE)
    expect(array[lib.getStartIndex(array, index) + structSize]).toBe(lib.Flags.END)
    expect(array.lastIndex).toBe(lib.getStartIndex(array, index) + structSize)
  })

  // Test 3: Throw an Error when Adding a Struct to a Full Array
  test('should throw an error when adding a struct to a full array', () => {
    /* INIT */
    const structSize = 2
    const nbStruct = 1
    const array = Float64StructArray(structSize, nbStruct)
    lib.addStruct(array, [1, 2])

    /* ERROR CHECK */
    expect(() => lib.addStruct(array, [3, 4])).toThrow(
      'Not enough space in the array to add the new struct.'
    )
  })

  // Test 4: Throw an Error when DataArray Length Does Not Match Struct Size
  test('should throw an error when dataArray length does not match struct size', () => {
    /* INIT */
    const structSize = 3
    const nbStruct = 2
    const array = Float64StructArray(structSize, nbStruct)

    /* ERROR CHECK */
    expect(() => lib.addStruct(array, [1, 2])).toThrow(
      'The length of dataArray (2) does not match the struct size (3).'
    )
  })
})

describe('Float64StructArray markStructAsDeleted Function Tests', () => {
  // Test 1: Valid Deletion and Idempotency
  test('valid deletion and idempotency', () => {
    /* INIT */
    const structSize = 3
    const nbStruct = 2
    const array = Float64StructArray(structSize, nbStruct)
    const index = lib.addStruct(array)

    /* RUN & CHECK RESULTS - Valid Deletion */
    lib.markStructAsDeleted(array, index)
    expect(array[lib.getStartIndex(array, index) - 1]).toBe(lib.Flags.DELETED)
    expect(array.nbToDelete).toBe(1)

    /* RUN & CHECK RESULTS - Idempotency */
    lib.markStructAsDeleted(array, index)
    expect(array[lib.getStartIndex(array, index) - 1]).toBe(lib.Flags.DELETED)
    expect(array.nbToDelete).toBe(1)
  })

  // Test 2: Edge Cases (Deletion at the Beginning and End of the Array)
  test('edge cases (deletion at the beginning and end of the array)', () => {
    /* INIT */
    const nbStruct = 3
    const structSize = 4
    const array = Float64StructArray(structSize, nbStruct)
    const indexFirstStruct = lib.addStruct(array)
    lib.addStruct(array) // Adding a middle struct
    const indexLastStruct = lib.addStruct(array)

    /* RUN & CHECK RESULTS - Deletion at the Beginning */
    lib.markStructAsDeleted(array, indexFirstStruct)
    expect(array[lib.getStartIndex(array, indexFirstStruct) - 1]).toBe(lib.Flags.DELETED)

    /* RUN & CHECK RESULTS - Deletion at the End */
    lib.markStructAsDeleted(array, indexLastStruct)
    expect(array[lib.getStartIndex(array, indexLastStruct) - 1]).toBe(lib.Flags.DELETED)
  })

  // Test 3: Out of Bounds and Invalid Input
  test('out of bounds and invalid input', () => {
    /* INIT */
    const nbStruct = 3
    const structSize = 4
    const array = Float64StructArray(structSize, nbStruct)

    /* ERROR CHECK - Out of Bounds */
    expect(() => lib.markStructAsDeleted(array, -1)).toThrow('Index is out of bounds.')
    expect(() => lib.markStructAsDeleted(array, nbStruct)).toThrow('Index is out of bounds.')

    /* ERROR CHECK - No Valid Struct at Specified Index */
    expect(() => lib.markStructAsDeleted(array, nbStruct - 1)).toThrow(
      'No valid struct at the specified index.'
    )
  })
})

describe('Float64StructArray compact Function Tests', () => {
  // Utility function to initialize test array
  const initTestArray = (deletionFlags) => {
    const array = Float64StructArray(1, 5)
    for (let i = 0; i < deletionFlags.length; i++) {
      lib.addStruct(array, [i + 1])
      if (!deletionFlags[i]) {
        lib.markStructAsDeleted(array, i)
      }
    }
    return array
  }

  // Test 1: Deleting the First Struct and Compacting
  test('deleting the first struct and compacting', () => {
    /* INIT */
    const array = initTestArray([false, true, true, true, true])

    /* RUN */
    lib.compact(array)

    /* CHECKS RESULTS */
    const expected = [
      lib.Flags.ACTIVE,
      2,
      lib.Flags.ACTIVE,
      3,
      lib.Flags.ACTIVE,
      4,
      lib.Flags.ACTIVE,
      5,
      lib.Flags.END,
      0,
      0,
    ]
    expect(Array.from(array)).toEqual(expected)
    expect(array.lastIndex).toBe(8)
    expect(array.nbToDelete).toBe(0)
    expect(array.nbCurrentStruct).toBe(4)
  })

  // Test 2: Compacting with All but the Last Struct Remaining
  test('compacting with all but the last struct remaining', () => {
    /* INIT */
    const array = initTestArray([true, true, true, true, false])

    /* RUN */
    lib.compact(array)

    /* CHECKS RESULTS */
    const expected = [
      lib.Flags.ACTIVE,
      1,
      lib.Flags.ACTIVE,
      2,
      lib.Flags.ACTIVE,
      3,
      lib.Flags.ACTIVE,
      4,
      lib.Flags.END,
      0,
      0,
    ]
    expect(Array.from(array)).toEqual(expected)
    expect(array.lastIndex).toBe(8)
    expect(array.nbToDelete).toBe(0)
    expect(array.nbCurrentStruct).toBe(4)
  })

  // Test 3: Deletion and Compaction with the First Two Structs Removed
  test('deletion and compaction when the first two structs are removed', () => {
    /* INIT */
    const array = initTestArray([false, false, true, true, true])

    /* RUN */
    lib.compact(array)

    /* CHECKS RESULTS */
    const expected = [
      lib.Flags.ACTIVE,
      3,
      lib.Flags.ACTIVE,
      4,
      lib.Flags.ACTIVE,
      5,
      lib.Flags.END,
      0,
      0,
      0,
      0,
    ]
    expect(Array.from(array)).toEqual(expected)
    expect(array.lastIndex).toBe(6)
    expect(array.nbToDelete).toBe(0)
    expect(array.nbCurrentStruct).toBe(3)
  })

  // Continuing Float64StructArray compact Function Tests

  // Test 4: Deleting the Last Two Structs and Compacting
  test('deleting the last two structs and compacting', () => {
    /* INIT */
    const array = initTestArray([true, true, true, false, false])

    /* RUN */
    lib.compact(array)

    /* CHECKS RESULTS */
    const expected = [
      lib.Flags.ACTIVE,
      1,
      lib.Flags.ACTIVE,
      2,
      lib.Flags.ACTIVE,
      3,
      lib.Flags.END,
      0,
      0,
      0,
      0,
    ]
    expect(Array.from(array)).toEqual(expected)
    expect(array.lastIndex).toBe(6)
    expect(array.nbToDelete).toBe(0)
    expect(array.nbCurrentStruct).toBe(3)
  })

  // Test 5: Compacting After Removing All Middle Structs
  test('compacting after removing all middle structs', () => {
    /* INIT */
    const array = initTestArray([true, false, false, false, true])

    /* RUN */
    lib.compact(array)

    /* CHECKS RESULTS */
    const expected = [lib.Flags.ACTIVE, 1, lib.Flags.ACTIVE, 5, lib.Flags.END, 0, 0, 0, 0, 0, 0]
    expect(Array.from(array)).toEqual(expected)
    expect(array.lastIndex).toBe(4)
    expect(array.nbToDelete).toBe(0)
    expect(array.nbCurrentStruct).toBe(2)
  })

  // Test 6: Deletion and Compaction of Alternating Structs
  test('deletion and compaction of alternating structs', () => {
    /* INIT */
    const array = initTestArray([true, false, true, false, true])

    /* RUN */
    lib.compact(array)

    /* CHECKS RESULTS */
    const expected = [
      lib.Flags.ACTIVE,
      1,
      lib.Flags.ACTIVE,
      3,
      lib.Flags.ACTIVE,
      5,
      lib.Flags.END,
      0,
      0,
      0,
      0,
    ]
    expect(Array.from(array)).toEqual(expected)
    expect(array.lastIndex).toBe(6)
    expect(array.nbToDelete).toBe(0)
    expect(array.nbCurrentStruct).toBe(3)
  })

  // Test 7: Compaction with Multiple Deletions and End Flag Set
  test('compaction with multiple deletions and end flag set', () => {
    /* INIT */
    let array = initTestArray([true, true, false, false])

    /* RUN */
    lib.compact(array)

    /* CHECKS RESULTS */
    const expected = [lib.Flags.ACTIVE, 1, lib.Flags.ACTIVE, 2, lib.Flags.END, 0, 0, 0, 0, 0, 0]
    expect(Array.from(array)).toEqual(expected)
    expect(array.lastIndex).toBe(4)
    expect(array.nbToDelete).toBe(0)
    expect(array.nbCurrentStruct).toBe(2)
  })

  // Continuing Float64StructArray compact Function Tests

  // Test 8: Compaction of an Empty Array
  test('compaction of an empty array', () => {
    /* INIT */
    let array = Float64StructArray(1, 5)

    /* RUN */
    lib.compact(array)

    /* CHECKS RESULTS */
    const expected = [lib.Flags.END, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    expect(Array.from(array)).toEqual(expected)
    expect(array.lastIndex).toBe(0)
    expect(array.nbToDelete).toBe(0)
    expect(array.nbCurrentStruct).toBe(0)
  })

  // Test 9: Delete All Structs
  test('delete all structs', () => {
    /* INIT */
    let array = initTestArray([false, false, false, false, false])

    /* RUN */
    lib.compact(array)

    /* CHECKS RESULTS */
    const expected = [lib.Flags.END, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    expect(Array.from(array)).toEqual(expected)
    expect(array.lastIndex).toBe(0)
    expect(array.nbToDelete).toBe(0)
    expect(array.nbCurrentStruct).toBe(0)
  })

  // Test 10: Compaction with No Structs to Delete
  test('compaction with no structs to delete', () => {
    /* INIT */
    let array = initTestArray([true, true, true, true, true])

    /* RUN */
    lib.compact(array)

    /* CHECKS RESULTS */
    const expected = [
      lib.Flags.ACTIVE,
      1,
      lib.Flags.ACTIVE,
      2,
      lib.Flags.ACTIVE,
      3,
      lib.Flags.ACTIVE,
      4,
      lib.Flags.ACTIVE,
      5,
      lib.Flags.END,
    ]
    expect(Array.from(array)).toEqual(expected)
    expect(array.lastIndex).toBe(10)
    expect(array.nbToDelete).toBe(0)
    expect(array.nbCurrentStruct).toBe(5)
  })

  describe('Float64StructArray compact Function Tests', () => {
    // Test 11: Compaction of a Large Data Array
    test('compaction of a large data array', () => {
      /* INIT */
      const structSize = 7
      const nbStruct = 10_000
      let array = Float64StructArray(structSize, nbStruct)

      // Generate primes using the Sieve of Eratosthenes
      const isPrime = Array(nbStruct).fill(true)
      isPrime[0] = isPrime[1] = false
      for (let i = 2; i * i < nbStruct; i++) {
        if (isPrime[i]) {
          for (let j = i * i; j < nbStruct; j += i) {
            isPrime[j] = false
          }
        }
      }

      // Add structs with value from 0 to nbStruct
      // Mark structs as deleted if the value is not a prime
      for (let i = 1; i <= nbStruct; i++) {
        const structData = new Array(structSize).fill(i)
        lib.addStruct(array, structData)
        if (!isPrime[i]) {
          lib.markStructAsDeleted(array, i - 1)
        }
      }

      // The expected array is composed of all the prime numbers from 1 to nbStruct
      const expected = Float64StructArray(structSize, nbStruct)
      for (let i = 1; i <= nbStruct; i++) {
        if (isPrime[i]) {
          const structData = new Array(structSize).fill(i)
          lib.addStruct(expected, structData)
        }
      }

      /* RUN */
      lib.compact(array)

      /* CHECKS RESULTS */
      const nbPrimes = isPrime.filter((x) => x).length
      const lastIndexExpected =
        lib.NB_ARRAY_FLAGS + (structSize + lib.NB_STRUCT_FLAGS) * nbPrimes - 1
      expect(Array.from(array)).toEqual(Array.from(expected))
      expect(array.lastIndex).toBe(lastIndexExpected)
      expect(array.nbToDelete).toBe(0)
      expect(array.nbCurrentStruct).toBe(nbPrimes)
    })
  })
})
