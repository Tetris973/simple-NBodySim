import { SimpleEngineController } from '#src/engine/SimpleEngineController.js'
import { loadNBodyFromJSON } from '#src/services/nbodyLoader.js'
import { Worker } from 'worker_threads'

const worker = new Worker('./src/engine/SimpleEngineWorker.js')
const control = await SimpleEngineController(worker)
const entities = await loadNBodyFromJSON('./data/planetsConfig.json')
const dataArray = []

// register call back to display results
control.onEngineData((data) => {
  dataArray.push(data)
})

await control.init()
await control.getEngineInfos()
await control.setEntities(entities)
await control.setTask('nBodyVerlet')
await control.validate()
await control.start()

// wait for 2 seconds then stop the engine
let result
setTimeout(async () => {
  result = await control.stop()
  result = await control.getEngineInfos()
  console.log('getEngineInfos result:', result)
  control.terminate()
}, 10)
