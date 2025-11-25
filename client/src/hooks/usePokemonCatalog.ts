import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

type CatalogState = 'idle' | 'loading' | 'ready' | 'error';

export const usePokemonCatalog = () => {
  const [state, setState] = useState<CatalogState>('idle');
  const [names, setNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchCatalog = async () => {
      try {
        setState('loading');
        const response = await apiClient.get('pokemon/catalog').json<{ data: string[] }>();
        if (!mounted) return;
        setNames(response.data);
        setState('ready');
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load suggestions.');
        setState('error');
      }
    };

    fetchCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  return {
    names,
    loading: state === 'loading',
    ready: state === 'ready',
    error,
  } as const;
};
