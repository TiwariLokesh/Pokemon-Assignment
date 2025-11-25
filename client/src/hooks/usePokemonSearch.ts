import { useCallback, useEffect, useRef, useState } from 'react';
import ky, { type BeforeRequestHook } from 'ky';
import type { PokemonData } from '../types';

type Status = 'idle' | 'loading' | 'success' | 'error';

const attachClientHeader: BeforeRequestHook = (request: Request) => {
  request.headers.set('x-client', 'novadex-ui');
};

const api = ky.create({
  prefixUrl: '/api',
  timeout: 8000,
  hooks: {
    beforeRequest: [attachClientHeader],
  },
});

export const usePokemonSearch = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PokemonData | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
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
      const response = await api
        .get('pokemon', {
          searchParams: { name: trimmed.toLowerCase() },
          signal: controller.signal,
        })
        .json<{ data: PokemonData }>();

      setData(response.data);
      setStatus('success');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError(
        err instanceof Error ? err.message : 'Unable to load that Pokémon right now.',
      );
      setStatus('error');
    }
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { status, error, data, search } as const;
};
