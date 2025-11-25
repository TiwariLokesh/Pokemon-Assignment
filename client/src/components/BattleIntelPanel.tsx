import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Swords, Crosshair } from 'lucide-react';
import clsx from 'clsx';
import type { PokemonData, DefenseMatchup, AttackMatchup, MatchupReport } from '../types';
import { useBattleIntel } from '../hooks/useBattleIntel';
import { formatPokemonLabel } from '../utils/pokemon';
import { PokemonSuggestInput } from './PokemonSuggestInput';

const formatMultiplier = (value: number) => {
  if (!Number.isFinite(value)) return 'x1';
  return value % 1 === 0 ? `x${value}` : `x${value.toFixed(1)}`;
};

type BattleIntelPanelProps = {
  subject: PokemonData;
  catalog: string[];
  catalogLoading?: boolean;
  catalogReady?: boolean;
  catalogError?: string | null;
};

export const BattleIntelPanel = ({
  subject,
  catalog,
  catalogLoading = false,
  catalogReady = true,
  catalogError = null,
}: BattleIntelPanelProps) => {
  const { report, status, error, meta, analyze } = useBattleIntel(subject.name);
  const [opponentDraft, setOpponentDraft] = useState('');

  useEffect(() => {
    setOpponentDraft('');
  }, [subject.name]);

  const handleSubmit = async (normalized: string) => {
    const target = normalized || null;
    await analyze(target);
    return true;
  };

  const handleReset = () => {
    setOpponentDraft('');
    analyze(null);
  };

  const opponentLabel = meta?.opponent?.name ? formatPokemonLabel(meta.opponent.name) : null;
  const intelReady = report && status !== 'error';

  const defenseThreats = useMemo<DefenseMatchup[]>(
    () => (report?.defense.vulnerableTo ?? []).slice(0, 4),
    [report]
  );
  const resistHighlights = useMemo<DefenseMatchup[]>(
    () => (report?.summary.resistHighlights ?? []).slice(0, 4),
    [report]
  );
  const offenseHighlights = useMemo<AttackMatchup[]>(
    () => (report?.attack.strongAgainst ?? []).slice(0, 4),
    [report]
  );

  return (
    <motion.section
      layout
      className="w-full max-w-5xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.1 }}
    >
      <div className="glow-border">
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-dex-card/80 to-dex-card/50 backdrop-blur-xl p-8 space-y-6">
          <header className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Battle Intel</p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-3xl capitalize">
                {formatPokemonLabel(subject.name)} Tactical Read
              </h2>
              {report?.versus?.verdict && (
                <span className="px-3 py-1 rounded-full text-xs tracking-[0.2em] bg-white/10 border border-white/15">
                  {report.versus.verdict}
                </span>
              )}
            </div>
            <p className="text-white/60 max-w-3xl">
              Run scenario analysis against any opponent to see how {formatPokemonLabel(subject.name)} performs on
              offense and defense using live type-effectiveness data.
            </p>
          </header>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <PokemonSuggestInput
                value={opponentDraft}
                onChange={setOpponentDraft}
                onSubmit={handleSubmit}
                placeholder="Enter opponent name (e.g., charizard)"
                buttonLabel={status === 'loading' ? 'Analyzing…' : 'Run Intel'}
                isBusy={status === 'loading' && !report}
                suggestions={catalog}
                suggestionsLoading={catalogLoading}
                suggestionsReady={catalogReady}
                suggestionsError={catalogError}
                allowEmpty
                clearOnSuccess={false}
                enforceCatalog
              />
            </div>
            {report?.versus && (
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/15 text-white/80"
              >
                Clear opponent
              </button>
            )}
          </div>

          {error && (
            <div className="text-rose-200 bg-rose-500/10 border border-rose-500/30 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {!intelReady && status === 'loading' && <IntelSkeleton />}

          {intelReady && report && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <IntelCard title="Defense Radar" icon={<Shield className="w-5 h-5" />}>
                  <p className="text-sm text-white/60">Incoming damage profile based on type coverage.</p>
                  <IntelChipList label="Biggest Threats" tone="danger" entries={defenseThreats} />
                  <IntelChipList label="Resist Highlights" tone="safe" entries={resistHighlights} />
                </IntelCard>

                <IntelCard title="Offense Blueprint" icon={<Swords className="w-5 h-5" />}>
                  <p className="text-sm text-white/60">Top damage routes unlocked by current typing.</p>
                  <div className="flex flex-wrap gap-3">
                    {offenseHighlights.map((item) => (
                      <div
                        key={`${item.type}-${item.target}`}
                        className="flex flex-col gap-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10"
                      >
                        <span className="text-xs tracking-[0.2em] uppercase text-white/60">{item.type} ➜ {item.target}</span>
                        <span className="text-lg font-semibold text-emerald-200">{formatMultiplier(item.multiplier)}</span>
                      </div>
                    ))}
                    {!offenseHighlights.length && <p className="text-white/60">No standout targets yet.</p>}
                  </div>
                </IntelCard>
              </div>

              {report.versus && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Crosshair className="w-5 h-5 text-amber-200" />
                    <p className="text-lg font-semibold">
                      Head-to-head vs {opponentLabel ?? 'selected opponent'}
                    </p>
                    {meta?.opponent?.source && (
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/15">
                        {meta.opponent.source === 'cache' ? 'cached' : 'live'} data
                      </span>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <VersusCard
                      title="Offensive Outlook"
                      icon={<Activity className="w-5 h-5 text-emerald-200" />}
                      metricLabel="Best strike"
                      primaryLabel={report.versus.offense.bestType ?? 'Any'}
                      primaryValue={formatMultiplier(report.versus.offense.multiplier)}
                      breakdown={report.versus.offense.breakdown}
                    />
                    <VersusCard
                      title="Defensive Pressure"
                      icon={<Shield className="w-5 h-5 text-rose-200" />}
                      metricLabel="Threat focus"
                      primaryLabel={report.versus.defense.riskiestType ?? 'Balanced'}
                      primaryValue={formatMultiplier(report.versus.defense.multiplier)}
                      breakdown={report.versus.defense.breakdown}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

type IntelCardProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
};

const IntelCard = ({ title, icon, children }: IntelCardProps) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
    <div className="flex items-center gap-2 text-lg font-semibold">
      <span className="p-2 rounded-xl bg-white/10 text-amber-200">{icon}</span>
      {title}
    </div>
    {children}
  </div>
);

type IntelChipListProps = {
  label: string;
  entries: DefenseMatchup[];
  tone: 'danger' | 'safe';
};

const IntelChipList = ({ label, entries, tone }: IntelChipListProps) => (
  <div className="space-y-2">
    <p className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</p>
    <div className="flex flex-wrap gap-2">
      {entries.map((entry, index) => (
        <span
          key={`${entry.type}-${index}`}
          className={clsx(
            'px-4 py-2 rounded-2xl border text-sm capitalize flex items-center gap-2',
            tone === 'danger' && 'border-rose-400/40 bg-rose-400/10 text-rose-100',
            tone === 'safe' && 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
          )}
        >
          {entry.type}
          <strong className="font-semibold">{formatMultiplier(entry.multiplier)}</strong>
        </span>
      ))}
      {!entries.length && <p className="text-white/60">No data</p>}
    </div>
  </div>
);

type VersusCardProps = {
  title: string;
  icon: ReactNode;
  metricLabel: string;
  primaryLabel: string;
  primaryValue: string;
  breakdown: NonNullable<MatchupReport['versus']>['offense']['breakdown'];
};

const VersusCard = ({ title, icon, metricLabel, primaryLabel, primaryValue, breakdown }: VersusCardProps) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
    <div className="flex items-center gap-2 text-lg font-semibold">
      <span className="p-2 rounded-xl bg-white/10">{icon}</span>
      {title}
    </div>
    <div className="flex items-baseline gap-3">
      <p className="text-4xl font-bold text-white">{primaryValue}</p>
      <span className="text-sm uppercase tracking-[0.3em] text-white/50">{metricLabel}</span>
    </div>
    <p className="text-white/70 capitalize">Focus: {primaryLabel}</p>
    <div className="space-y-2">
      {breakdown.slice(0, 4).map((entry) => (
        <div key={entry.attackType} className="flex justify-between text-sm text-white/80">
          <span className="capitalize">{entry.attackType}</span>
          <strong>{formatMultiplier(entry.multiplier)}</strong>
        </div>
      ))}
      {!breakdown.length && <p className="text-white/60 text-sm">No matchup data.</p>}
    </div>
  </div>
);

const IntelSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {[1, 2].map((key) => (
      <div key={key} className="rounded-3xl border border-white/5 bg-white/5 p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-white/10 rounded" />
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3].map((chip) => (
            <span key={chip} className="h-9 bg-white/10 rounded-2xl w-24" />
          ))}
        </div>
      </div>
    ))}
  </div>
);
