import { typeChart, typeList } from '../data/typeChart.js'

const MULTIPLIER_BINS = {
  strong: (value) => value > 1,
  weak: (value) => value > 0 && value < 1,
  immune: (value) => value === 0
}

const formatMultiplier = (value) => Number(value.toFixed(2))

const matchupMultiplier = (attackerType, defenderTypes) =>
  defenderTypes.reduce((product, defender) => product * (typeChart[attackerType]?.[defender] ?? 1), 1)

const evaluateDefenseBuckets = (types) => {
  const defense = {
    resistantTo: [],
    vulnerableTo: [],
    immuneTo: []
  }

  typeList.forEach((opponentType) => {
    const multiplier = matchupMultiplier(opponentType, types)
    const payload = { type: opponentType, multiplier: formatMultiplier(multiplier) }
    if (MULTIPLIER_BINS.immune(multiplier)) defense.immuneTo.push(payload)
    else if (MULTIPLIER_BINS.strong(multiplier)) defense.vulnerableTo.push(payload)
    else if (MULTIPLIER_BINS.weak(multiplier)) defense.resistantTo.push(payload)
  })

  return defense
}

const evaluateAttackBuckets = (types) => {
  const attack = {
    strongAgainst: [],
    weakAgainst: [],
    noEffect: []
  }

  types.forEach((attackType) => {
    typeList.forEach((targetType) => {
      const effectiveness = typeChart[attackType]?.[targetType] ?? 1
      const payload = { type: attackType, target: targetType, multiplier: formatMultiplier(effectiveness) }
      if (effectiveness === 0) attack.noEffect.push(payload)
      else if (effectiveness > 1) attack.strongAgainst.push(payload)
      else if (effectiveness < 1) attack.weakAgainst.push(payload)
    })
  })

  return attack
}

const deriveVerdict = (attackMultiplier, defenseMultiplier) => {
  if (attackMultiplier >= 4 && defenseMultiplier <= 1) return 'Crushing advantage'
  if (attackMultiplier >= 2 && defenseMultiplier <= 1) return 'Favorable matchup'
  if (defenseMultiplier >= 4 && attackMultiplier <= 1) return 'Critical threat'
  if (attackMultiplier <= 0.5 && defenseMultiplier >= 2) return 'Danger zone'
  return 'Balanced showdown'
}

const summarizeVersus = (types, opponentTypes) => {
  if (!opponentTypes?.length) return null

  const offenseBreakdown = types.map((attackType) => ({
    attackType,
    multiplier: formatMultiplier(matchupMultiplier(attackType, opponentTypes))
  })).sort((a, b) => b.multiplier - a.multiplier)

  const defenseBreakdown = opponentTypes.map((attackType) => ({
    attackType,
    multiplier: formatMultiplier(matchupMultiplier(attackType, types))
  })).sort((a, b) => b.multiplier - a.multiplier)

  const bestOffense = offenseBreakdown[0] ?? null
  const worstDefense = defenseBreakdown[0] ?? null

  return {
    opponentTypes,
    offense: {
      bestType: bestOffense?.attackType ?? null,
      multiplier: bestOffense?.multiplier ?? 1,
      breakdown: offenseBreakdown
    },
    defense: {
      riskiestType: worstDefense?.attackType ?? null,
      multiplier: worstDefense?.multiplier ?? 1,
      breakdown: defenseBreakdown
    },
    verdict: deriveVerdict(bestOffense?.multiplier ?? 1, worstDefense?.multiplier ?? 1)
  }
}

export const buildMatchupReport = (types = [], opponentTypes = []) => {
  const defense = evaluateDefenseBuckets(types)
  const attack = evaluateAttackBuckets(types)

  const bestCounters = defense.vulnerableTo
    .map((entry) => entry.type)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)

  const resistHighlights = defense.resistantTo.slice(0, 5)

  return {
    defense,
    attack,
    summary: {
      bestCounters,
      resistHighlights
    },
    versus: summarizeVersus(types, opponentTypes)
  }
}
