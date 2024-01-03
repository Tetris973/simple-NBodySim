import { CommandProcessor } from '#src/webSockets/tcpSockets/CommandProcessor.js'

describe('CommandProcessor tests', () => {
  const roomManagerMock = {
    getRoomContextByUserId: jest.fn(() => 'roomContext'),
  }

  let processCommand
  let userIds
  let commandSets
  const mockCommandCategory = 'mockCategory'

  beforeEach(() => {
    commandSets = {
      [mockCommandCategory]: {},
    }
    userIds = { userId: 'userId', socketId: 'socketId', channelId: 'channelId' }
    processCommand = CommandProcessor(roomManagerMock, commandSets)
  })
  test('should process a valid command', async () => {
    // INIT
    const command = 'asyncCommand'
    const asyncResolve = { action: command, status: 'success', data: null }
    const data = {
      data1: 'data1',
      data2: 'data2',
    }

    commandSets[mockCommandCategory].asyncCommand = jest.fn((context) =>
      Promise.resolve({ ...asyncResolve, data: context.data })
    )

    // RUN
    const result = await processCommand(mockCommandCategory, command, userIds, data)

    // CHECK RESULTS
    expect(result).toEqual({ action: command, status: 'success', data })
  })

  test('should process a valid sync command', async () => {
    // INIT
    const command = 'syncCommand'
    const syncResolve = { action: command, status: 'success', data: null }
    const data = {
      data1: 'data1',
      data2: 'data2',
    }

    commandSets[mockCommandCategory].syncCommand = jest.fn((context) => ({
      ...syncResolve,
      data: context.data,
    }))

    // RUN
    const result = await processCommand(mockCommandCategory, command, userIds, data)

    // CHECK RESULTS
    expect(result).toEqual({ action: command, status: 'success', data })
  })

  test('should return an error object when async command fails', async () => {
    // INIT
    const command = 'asyncErrorCommand'
    const asyncReject = { action: command, status: 'error', error: 'asyncErrorCommand' }

    commandSets[mockCommandCategory].asyncErrorCommand = jest.fn(() => Promise.resolve(asyncReject))

    // RUN
    const result = await processCommand(mockCommandCategory, command, userIds)

    // CHECK RESULTS
    expect(result).toEqual(asyncReject)
  })

  test('should return an error object when sync command fails', async () => {
    // INIT
    const command = 'syncErrorCommand'
    const syncReject = { action: command, status: 'error', error: 'syncErrorCommand' }

    commandSets[mockCommandCategory].syncErrorCommand = jest.fn(() => syncReject)

    // RUN
    const result = await processCommand(mockCommandCategory, command, userIds)

    // CHECK RESULTS
    expect(result).toEqual(syncReject)
  })

  test('should return an error object when uncaught error', async () => {
    // INIT
    const command = 'uncaughtErrorCommand'
    const data = {
      data1: 'data1',
      data2: 'data2',
    }
    const error = new Error('uncaughtError')
    commandSets[mockCommandCategory].uncaughtErrorCommand = jest.fn(() => {
      throw error
    })

    // RUN
    const result = await processCommand(mockCommandCategory, command, userIds, data)

    // CHECK RESULTS
    expect(result).toEqual({
      action: command,
      status: 'error',
      error: `unchaught error : ${error.message}`,
    })
  })

  test('should return an error when invalid category', async () => {
    // INIT
    const data = null
    const command = 'asyncCommand'
    const category = 'invalidCategory'

    // RUN
    const result = await processCommand(category, command, userIds, data)

    // CHECK RESULTS
    expect(result).toEqual({ action: category, status: 'error', error: 'Invalid command category' })
  })

  test('should return an error when invalid command', async () => {
    // INIT
    const data = null
    const command = 'invalidCommand'

    // RUN
    const result = await processCommand(mockCommandCategory, command, userIds, data)

    // CHECK RESULTS
    expect(result).toEqual({ action: command, status: 'error', error: 'Invalid command' })
  })
})
