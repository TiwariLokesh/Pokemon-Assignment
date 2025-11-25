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
