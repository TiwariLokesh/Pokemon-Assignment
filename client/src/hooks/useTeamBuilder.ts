import { useCallback, useEffect, useMemo, useState } from 'react';
import { HTTPError } from 'ky';
import type { PokemonData } from '../types';
import { apiClient } from '../lib/api';
import { normalizePokemonName } from '../utils/pokemon';
import { computeTeamMetrics, MAX_TEAM_SIZE } from '../utils/teamMetrics';

const STORAGE_KEY = 'novadex-team-v1';

type TeamStatus = 'idle' | 'loading' | 'success' | 'error';

const loadInitialTeam = (): PokemonData[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as PokemonData[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

export const useTeamBuilder = () => {
  const [team, setTeam] = useState<PokemonData[]>(loadInitialTeam);
  const [status, setStatus] = useState<TeamStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
  }, [team]);

  const metrics = useMemo(() => computeTeamMetrics(team), [team]);
  const slotsRemaining = MAX_TEAM_SIZE - team.length;

  const resetFeedback = useCallback(() => {
    setStatus('idle');
    setError(null);
    setLastAdded(null);
  }, []);

  const addPokemon = useCallback(
    (pokemon: PokemonData) => {
      setError(null);
      setLastAdded(null);
      if (team.length >= MAX_TEAM_SIZE) {
        setStatus('error');
        setError('Your squad is already full.');
        return false;
      }
      if (team.some((member) => member.name === pokemon.name)) {
        setStatus('error');
        setError('That Pokémon is already in your squad.');
        return false;
      }
      setTeam((prev) => [...prev, pokemon]);
      setStatus('success');
      setLastAdded(pokemon.name);
      return true;
    },
    [team]
  );

  const removePokemon = useCallback((name: string) => {
    setTeam((prev) => prev.filter((pokemon) => pokemon.name !== name));
    resetFeedback();
  }, [resetFeedback]);

  const clearTeam = useCallback(() => {
    setTeam([]);
    resetFeedback();
  }, [resetFeedback]);

  const addPokemonByName = useCallback(
    async (rawName: string) => {
      const normalized = normalizePokemonName(rawName);
      if (!rawName.trim()) {
        setStatus('error');
        setError('Enter a Pokémon name first.');
        return false;
      }
      if (!normalized) {
        setStatus('error');
        setError('Only letters, numbers, and dashes are allowed.');
        return false;
      }
      if (team.length >= MAX_TEAM_SIZE) {
        setStatus('error');
        setError('Your squad is already full.');
        return false;
      }
      if (team.some((member) => member.name === normalized)) {
        setStatus('error');
        setError('That Pokémon is already in your squad.');
        return false;
      }

      setStatus('loading');
      setError(null);
      try {
        const response = await apiClient
          .get('pokemon', { searchParams: { name: normalized } })
          .json<{ data: PokemonData }>();
        const success = addPokemon(response.data);
        if (!success) {
          setStatus('error');
          setError('Unable to add that Pokémon right now.');
          return false;
        }
        return true;
      } catch (err) {
        let message = 'Unable to fetch that Pokémon. Try again shortly.';
        if (err instanceof HTTPError) {
          const body = await err.response.json().catch(() => null);
          message = body?.error?.message ?? message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setStatus('error');
        setError(message);
        return false;
      }
    },
    [team, addPokemon]
  );

  return {
    team,
    metrics,
    status,
    error,
    lastAdded,
    slotsRemaining,
    addPokemon,
    addPokemonByName,
    removePokemon,
    clearTeam,
    resetFeedback,
  } as const;
};
