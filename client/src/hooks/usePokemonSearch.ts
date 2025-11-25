import { useCallback, useEffect, useRef, useState } from 'react';
import { HTTPError } from 'ky';
import type { PokemonData } from '../types';
import { apiClient } from '../lib/api';
import { normalizePokemonName } from '../utils/pokemon';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const usePokemonSearch = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PokemonData | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (name: string) => {
    const normalized = normalizePokemonName(name);
    if (!normalized) {
      setData(null);
      setStatus('idle');
      setError(null);
      abortRef.current?.abort();
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError(null);

    try {
      const response = await apiClient
        .get('pokemon', {
          searchParams: { name: normalized },
          signal: controller.signal,
        })
        .json<{ data: PokemonData }>();

      setData(response.data);
      setStatus('success');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      if (err instanceof HTTPError) {
        const body = await err.response.json().catch(() => null);
        if (err.response.status === 404) {
          setError('Aisa koi Pokemon nahi hai.');
        } else {
          setError(body?.error?.message ?? 'Pokémon data temporarily unavailable.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to load that Pokémon right now.');
      }
      setStatus('error');
    }
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { status, error, data, search } as const;
};
