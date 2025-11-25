import type { PokemonData, TeamMetrics } from '../types';
import { typeChart, typeList } from '../data/typeChart';

export const MAX_TEAM_SIZE = 6;

const multiply = (attackingType: string, defendingTypes: string[]) =>
  defendingTypes.reduce((product, defender) => product * (typeChart[attackingType]?.[defender] ?? 1), 1);

const roundStat = (value: number) => Math.round(value);

export const computeTeamMetrics = (team: PokemonData[]): TeamMetrics => {
  const uniqueTypes = Array.from(new Set(team.flatMap((pokemon) => pokemon.types))).sort();
  const weaknessMap: Record<string, number> = {};
  const resistMap: Record<string, number> = {};

  team.forEach((pokemon) => {
    typeList.forEach((attackType) => {
      const multiplier = multiply(attackType, pokemon.types);
      if (multiplier > 1) {
        weaknessMap[attackType] = (weaknessMap[attackType] ?? 0) + 1;
      } else if (multiplier < 1) {
        resistMap[attackType] = (resistMap[attackType] ?? 0) + 1;
      }
    });
  });

  const glaringWeaknesses = Object.entries(weaknessMap)
    .map(([type, affected]) => ({ type, affected }))
    .filter((entry) => entry.affected >= Math.max(2, Math.ceil(team.length / 2)))
    .sort((a, b) => b.affected - a.affected)
    .slice(0, 4);

  const sturdyResistances = Object.entries(resistMap)
    .map(([type, protectors]) => ({ type, protectors }))
    .sort((a, b) => b.protectors - a.protectors)
    .slice(0, 4);

  const totalBaseStat = team.reduce((sum, pokemon) => {
    const pokemonTotal = pokemon.stats.reduce((acc, stat) => acc + stat.base, 0);
    return sum + pokemonTotal;
  }, 0);

  const averageBaseTotal = team.length ? totalBaseStat / team.length : 0;

  return {
    size: team.length,
    uniqueTypes,
    coveragePercent: uniqueTypes.length / typeList.length,
    glaringWeaknesses,
    sturdyResistances,
    averageBaseTotal: roundStat(averageBaseTotal),
  };
};
