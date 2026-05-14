import sampleScenario from '@/data/sample-scenario.json'
import orionScenario from '@/data/orion-echo-supply-chain.json'

export const scenarioSources = {
  sample: sampleScenario,
  orion: orionScenario
} as const

export type ScenarioKey = keyof typeof scenarioSources

export function getScenarioSource(key: string) {
  return scenarioSources[key as ScenarioKey]
}

export function scenarioKeys(): ScenarioKey[] {
  return Object.keys(scenarioSources) as ScenarioKey[]
}
