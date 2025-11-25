export type PokemonStat = {
  label: string;
  base: number;
  effort: number;
};

export type PokemonAbility = {
  name: string;
  hidden: boolean;
};

export type PokemonData = {
  id: number;
  name: string;
  order: number;
  height: number;
  weight: number;
  baseExperience: number;
  types: string[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  sprites: string[];
  movesSample: string[];
  habitat: string;
  color: string;
  shape: string;
  genera?: string;
  flavorText?: string | null;
  growthRate?: string;
  captureRate?: number;
  eggGroups: string[];
  legendary: boolean;
  mythical: boolean;
};

export type DefenseMatchup = {
  type: string;
  multiplier: number;
};

export type AttackMatchup = {
  type: string;
  target: string;
  multiplier: number;
};

export type VersusBreakdown = {
  attackType: string;
  multiplier: number;
};

export type MatchupReport = {
  defense: {
    resistantTo: DefenseMatchup[];
    vulnerableTo: DefenseMatchup[];
    immuneTo: DefenseMatchup[];
  };
  attack: {
    strongAgainst: AttackMatchup[];
    weakAgainst: AttackMatchup[];
    noEffect: AttackMatchup[];
  };
  summary: {
    bestCounters: string[];
    resistHighlights: DefenseMatchup[];
  };
  versus: {
    opponentTypes: string[];
    offense: {
      bestType: string | null;
      multiplier: number;
      breakdown: VersusBreakdown[];
    };
    defense: {
      riskiestType: string | null;
      multiplier: number;
      breakdown: VersusBreakdown[];
    };
    verdict: string;
  } | null;
};

export type BattleIntelResponse = {
  data: MatchupReport;
  meta: {
    subject: string;
    opponent: {
      name: string;
      source: string;
    } | null;
  };
};
