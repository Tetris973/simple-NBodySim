import { loadNBodyFromJSON } from '../../../../../services/nBodyLoader'
import { nBodyVerlet } from '../../../../../engine/tasksLogic/simulationTasks/forces/nBodyVerlet'

describe('nBodyVerlet Tests', () => {
  let nBodies

  beforeEach(async () => {
    nBodies = await loadNBodyFromJSON('./src/data/planetsConfig.json')
  })

  test('should calculate accurately after 100 computations', () => {
    // INIT
    const dt = 0.001 // 1 ms time delta
    const precision = 3 // Number of decimal places for precision

    const expectedPositions = [
      { id: 'Mercure', posX: 5900, posY: 46999999999.99972 },
      { id: 'Venus', posX: 3500, posY: 110000000000 },
      { id: 'Terre', posX: 3000, posY: 150000000000 },
      { id: 'Mars', posX: 2600, posY: 210000000000 },
      { id: 'Jupiter', posX: 1300, posY: 740000000000 },
      { id: 'Saturne', posX: 1000, posY: 1300000000000 },
      { id: 'Uranus', posX: 710.0000000000013, posY: 2700000000000 },
      { id: 'Neptune', posX: 550, posY: 4400000000000 },
    ]

    // RUN
    for (let i = 0; i < 100; i++) {
      nBodyVerlet.function(nBodies, dt)
    }

    // CHECK RESULTS
    expectedPositions.forEach((expected) => {
      const body = nBodies.find((b) => b.id === expected.id)

      expect(body.pos.x).toBeCloseTo(expected.posX, precision)
      expect(body.pos.y).toBeCloseTo(expected.posY, precision)
    })
  })
})
