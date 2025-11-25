import { useCallback, useEffect, useRef, useState } from 'react';
import { HTTPError } from 'ky';
import type { BattleIntelResponse, MatchupReport } from '../types';
import { apiClient } from '../lib/api';
import { normalizePokemonName } from '../utils/pokemon';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useBattleIntel = (subjectName?: string) => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<MatchupReport | null>(null);
  const [meta, setMeta] = useState<BattleIntelResponse['meta'] | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchIntel = useCallback(
    async (opponentName?: string | null) => {
      if (!subjectName) return;
      const normalizedSubject = normalizePokemonName(subjectName);
      if (!normalizedSubject) return;

      const normalizedOpponent = opponentName ? normalizePokemonName(opponentName) : undefined;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus('loading');
      setError(null);

      try {
        const response = await apiClient
          .get(`pokemon/${normalizedSubject}/matchups`, {
            searchParams: normalizedOpponent ? { opponent: normalizedOpponent } : undefined,
            signal: controller.signal,
          })
          .json<BattleIntelResponse>();

        setReport(response.data);
        setMeta(response.meta);
        setStatus('success');
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        if (err instanceof HTTPError) {
          const body = await err.response.json().catch(() => null);
          setError(body?.error?.message ?? 'Unable to compute battle intel at the moment.');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unable to compute battle intel at the moment.');
        }
        setStatus('error');
      }
    },
    [subjectName]
  );

  useEffect(() => {
    if (!subjectName) {
      abortRef.current?.abort();
      setReport(null);
      setMeta(null);
      setStatus('idle');
      return;
    }
    fetchIntel(null);
  }, [subjectName, fetchIntel]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return {
    status,
    error,
    report,
    meta,
    analyze: fetchIntel,
  } as const;
};
