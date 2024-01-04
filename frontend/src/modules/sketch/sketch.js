import NBody from './NBodyRenderer'
import { setupPSEngine } from 'p5-sketch-editor'
import planetsConfig from './config/planetsConfig.json'
import engineConfig from './config/engineConfig.json'
import PathRenderer from './pathRenderer'
import CircleRenderer from './circleRenderer'

import { SocketConnectionManager } from '../webSockets/tcpSockets/SocketConnectionManager'
import { ChannelConnectionManager } from '../webSockets/udpSockets/ChannelConnectionManager'

/**
 * Creates an array of NBody instances based on the provided configuration.
 *
 * @param {Object[]} configs - An array of planet configurations.
 * @param {number} configs[].mass - The mass of the planet.
 * @param {number} configs[].initialX - The initial X position of the planet.
 * @param {number} configs[].initialY - The initial Y position of the planet.
 * @param {number[]} configs[].color - The RGB color of the planet.
 * @param {string} configs[].name - The name of the planet.
 * @param {number} configs[].radius - The radius of the planet.
 *
 * @returns {NBody[]} An array of NBody instances.
 */
function createPlanetsFromConfig(configs) {
  return configs.map((planet) => {
    const nbody = NBody(planet.mass, planet.name)
    nbody.setPosition(null, null)

    // Create PathRenderer for the planet
    const pathRenderer = PathRenderer(() => nbody.getPosition(), planet.color)
    nbody.addRenderer((drawer) => pathRenderer.draw(drawer))

    // Create CircleRenderer for the planet
    const circleRenderer = CircleRenderer(() => nbody.getPosition(), planet.color, planet.radius)
    nbody.addRenderer((drawer) => circleRenderer.draw(drawer))

    return nbody
  })
}

/**
 * Returns a function that configures the engine based on the provided configuration.
 *
 * @param {Object} config - The engine configuration.
 * @param {Object} config.plotter - The plotter configuration.
 * @param {Object} config.plotter.scale - The scale configuration for the plotter.
 * @param {number} config.plotter.scale.x - The X scale value for the plotter.
 * @param {number} config.plotter.scale.y - The Y scale value for the plotter.
 * @param {boolean} config.plotter.squareByX - Whether the plotter should square by X.
 * @param {number[]} config.plotter.backgroundColor - The RGB color for the background.
 * @param {Object} config.runner - The runner configuration.
 * @param {number} config.runner.simulationSpeed - The simulation speed for the runner.
 * @param {boolean} config.runner.movable - Whether the runner is movable.
 *
 * @returns {Function} A function that takes an engine and configures it.
 */
function getEngineConfigurator(config) {
  return (engine) => {
    engine.plotter.scale = config.plotter.scale
    engine.plotter.squareByX = config.plotter.squareByX
    engine.plotter.backgroundColor = config.plotter.backgroundColor
    engine.runner.simulationSpeed = config.runner.simulationSpeed
    engine.runner.movable = config.runner.movable
  }
}

/**
 * Configures and runs the simulator.
 *
 * @param {Object} simulator - The simulator instance.
 */
const runSimulator = async (simulator) => {
  // dummy fps object
  const Fps = () => {
    // setTimeOut to update the fps every second
    setInterval(() => {
      update = true
    }, 200)

    let currentFps = 0
    let update = true

    /* eslint-disable */
    return {
      draw: () => {
        fill(255)
        stroke(0)
        text('FPS: ' + currentFps.toFixed(2), 50, 50)

        if (!update) return
        currentFps = frameRate()
        update = false
      },
      update: () => {},
    }
    /* eslint-enable */
  }

  simulator.addObjects(Fps())

  simulator.setEngineConfig(getEngineConfigurator(engineConfig))

  const planets = createPlanetsFromConfig(planetsConfig)
  for (const planet of planets) {
    simulator.addObjects(planet)
  }

  // setup geckos and socket and data receiving
  const socketConnectionManager = SocketConnectionManager()
  const channelConnectionManager = ChannelConnectionManager()
  channelConnectionManager.setDataCallback((data) => {
    data.map((obj) => {
      const id = Object.keys(obj)[0] // Get the id (planet name)
      const pos = obj[id] // Get the position object
      planets.find((planet) => planet.name === id).setPosition(pos.x, pos.y)
    })
  })
  channelConnectionManager.connect()
  channelConnectionManager.setConnectionListener((id) => {
    console.log('trying to bind channel')
    socketConnectionManager.connect()
    socketConnectionManager.bindChannelId(id)
  })
}

/**
 * Initializes and starts the simulation engine.
 */
const start = async () => {
  await setupPSEngine(runSimulator)
}

export default start
