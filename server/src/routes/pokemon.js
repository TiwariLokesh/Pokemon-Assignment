import { Router } from 'express';
import createError from 'http-errors';
import { z } from 'zod';
import { fetchPokemonData } from '../pokeClient.js';
import { getCached, setCached } from '../cache.js';

const router = Router();
const paramsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(30)
    .regex(/^[a-z0-9-]+$/i, 'Use alphanumeric characters or dashes only'),
});

const parseName = (payload) => {
  const result = paramsSchema.safeParse(payload);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw createError(400, issue?.message ?? 'Invalid Pokémon name');
  }
  return result.data.name;
};

router.get('/', async (req, res, next) => {
  try {
    const name = parseName({ name: req.query.name });
    const cacheKey = `pokemon:${name.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ source: 'cache', data: cached });
    }

    const data = await fetchPokemonData(name);
    setCached(cacheKey, data);
    res.json({ source: 'live', data });
  } catch (error) {
    next(error);
  }
});

router.get('/:name', async (req, res, next) => {
  try {
    const name = parseName(req.params);
    const cacheKey = `pokemon:${name.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ source: 'cache', data: cached });
    }

    const data = await fetchPokemonData(name);
    setCached(cacheKey, data);
    res.json({ source: 'live', data });
  } catch (error) {
    next(error);
  }
});

export default router;
