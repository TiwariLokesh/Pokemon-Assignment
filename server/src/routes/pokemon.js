import { Router } from 'express'
import createError from 'http-errors'
import { z } from 'zod'
import { fetchPokemonData, fetchPokemonCatalog } from '../pokeClient.js'
import { getCached, setCached } from '../cache.js'
import { buildMatchupReport } from '../services/matchups.js'

const router = Router()
const paramsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(30)
    .regex(/^[a-z0-9-]+$/i, 'Use alphanumeric characters or dashes only')
})

const parseName = (payload) => {
  const result = paramsSchema.safeParse(payload)
  if (!result.success) {
    const issue = result.error.issues[0]
    throw createError(400, issue?.message ?? 'Invalid Pokémon name')
  }
  return result.data.name
}

const hydratePokemon = async (name) => {
  const cacheKey = `pokemon:${name.toLowerCase()}`
  const cached = getCached(cacheKey)
  if (cached) {
    return { data: cached, source: 'cache' }
  }

  const liveData = await fetchPokemonData(name)
  setCached(cacheKey, liveData)
  return { data: liveData, source: 'live' }
}

router.get('/catalog', async (_req, res, next) => {
  try {
    const cacheKey = 'pokemon:catalog'
    let catalog = getCached(cacheKey)
    if (!catalog) {
      catalog = await fetchPokemonCatalog()
      setCached(cacheKey, catalog)
    }
    res.json({ data: catalog })
  } catch (error) {
    next(error)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const name = parseName({ name: req.query.name })
    const { data, source } = await hydratePokemon(name)
    res.json({ source, data })
  } catch (error) {
    next(error)
  }
})

router.get('/:name/matchups', async (req, res, next) => {
  try {
    const name = parseName(req.params)
    const { data } = await hydratePokemon(name)

    let opponent = null
    let opponentTypes = []
    if (req.query.opponent) {
      const opponentName = parseName({ name: req.query.opponent })
      const opponentPayload = await hydratePokemon(opponentName)
      opponent = {
        name: opponentPayload.data.name,
        source: opponentPayload.source
      }
      opponentTypes = opponentPayload.data.types
    }

    const report = buildMatchupReport(data.types, opponentTypes)
    res.json({
      data: report,
      meta: {
        subject: data.name,
        opponent
      }
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:name', async (req, res, next) => {
  try {
    const name = parseName(req.params)
    const { data, source } = await hydratePokemon(name)
    res.json({ source, data })
  } catch (error) {
    next(error)
  }
})

export default router
