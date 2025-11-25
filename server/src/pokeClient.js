import axios from 'axios';
import createError from 'http-errors';

const api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 8000,
});

const sanitizeFlavorText = (entries = []) => {
  const englishEntry = entries.find((entry) => entry.language?.name === 'en');
  if (!englishEntry) return null;
  return englishEntry.flavor_text.replace(/\f|\n|\r/g, ' ').trim();
};

const buildSpriteList = (sprites) => {
  const { other = {}, versions, ...rest } = sprites ?? {};
  const flattened = Object.values({ ...rest, ...other?.['official-artwork'] }).filter(Boolean);
  return flattened;
};

const formatPokemon = (pokemonPayload, speciesPayload) => ({
  id: pokemonPayload.id,
  name: pokemonPayload.name,
  order: pokemonPayload.order,
  height: pokemonPayload.height / 10, // meters
  weight: pokemonPayload.weight / 10, // kilograms
  baseExperience: pokemonPayload.base_experience,
  types: pokemonPayload.types
    .sort((a, b) => a.slot - b.slot)
    .map(({ type }) => type.name),
  abilities: pokemonPayload.abilities
    .sort((a, b) => Number(a.is_hidden) - Number(b.is_hidden))
    .map(({ ability, is_hidden }) => ({ name: ability.name, hidden: is_hidden })),
  stats: pokemonPayload.stats.map(({ base_stat, effort, stat }) => ({
    label: stat.name,
    base: base_stat,
    effort,
  })),
  sprites: buildSpriteList(pokemonPayload.sprites),
  movesSample: pokemonPayload.moves
    .slice(0, 8)
    .map(({ move }) => move.name),
  habitat: speciesPayload.habitat?.name ?? 'unknown',
  color: speciesPayload.color?.name ?? 'unknown',
  shape: speciesPayload.shape?.name ?? 'unknown',
  genera: speciesPayload.genera?.find((entry) => entry.language?.name === 'en')?.genus,
  flavorText: sanitizeFlavorText(speciesPayload.flavor_text_entries),
  growthRate: speciesPayload.growth_rate?.name,
  captureRate: speciesPayload.capture_rate,
  eggGroups: speciesPayload.egg_groups?.map((group) => group.name) ?? [],
  legendary: speciesPayload.is_legendary,
  mythical: speciesPayload.is_mythical,
});

export const fetchPokemonData = async (name) => {
  try {
    const lowerName = name.toLowerCase();
    const [pokemonRes, speciesRes] = await Promise.all([
      api.get(`/pokemon/${lowerName}`),
      api.get(`/pokemon-species/${lowerName}`),
    ]);

    return formatPokemon(pokemonRes.data, speciesRes.data);
  } catch (error) {
    if (error.response?.status === 404) {
      throw createError(404, 'Pokémon not found');
    }
    if (axios.isAxiosError(error)) {
      throw createError(502, `Vendor error: ${error.message}`);
    }
    throw createError(500, 'Unexpected error while talking to PokeAPI');
  }
};
