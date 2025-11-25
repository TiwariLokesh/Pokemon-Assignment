import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Shield, AlertTriangle, Layers, Users } from 'lucide-react';
import clsx from 'clsx';
import type { PokemonData, TeamMetrics } from '../types';
import { formatPokemonLabel } from '../utils/pokemon';
import { MAX_TEAM_SIZE } from '../utils/teamMetrics';
import { PokemonSuggestInput } from './PokemonSuggestInput';

interface TeamBuilderPanelProps {
  team: PokemonData[];
  metrics: TeamMetrics;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  lastAdded: string | null;
  slotsRemaining: number;
  catalog: string[];
  catalogLoading: boolean;
  catalogReady: boolean;
  catalogError: string | null;
  onAddByName: (name: string) => Promise<boolean>;
  onRemove: (name: string) => void;
  onClear: () => void;
  resetFeedback: () => void;
}

export const TeamBuilderPanel = ({
  team,
  metrics,
  status,
  error,
  lastAdded,
  slotsRemaining,
  catalog,
  catalogLoading,
  catalogReady,
  catalogError,
  onAddByName,
  onRemove,
  onClear,
  resetFeedback,
}: TeamBuilderPanelProps) => {
  const [nameInput, setNameInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'success' && lastAdded) {
      setFeedback(`${formatPokemonLabel(lastAdded)} locked in!`);
      setNameInput('');
      const timer = setTimeout(() => setFeedback(null), 2500);
      return () => clearTimeout(timer);
    }
    if (status === 'error' && error) {
      setFeedback(error);
    }
  }, [status, lastAdded, error]);

  const handleInputChange = (value: string) => {
    if (feedback) setFeedback(null);
    if (status !== 'idle') resetFeedback();
    setNameInput(value);
  };

  const handleSuggestSubmit = async (normalized: string) => {
    const success = await onAddByName(normalized);
    if (!success) return false;
    setNameInput('');
    return true;
  };

  const emptySlots = useMemo(() => MAX_TEAM_SIZE - team.length, [team.length]);
  const slots = useMemo(() => Array.from({ length: MAX_TEAM_SIZE }, (_, index) => team[index] ?? null), [team]);

  return (
    <motion.section
      layout
      className="w-full max-w-5xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.15 }}
    >
      <div className="glow-border">
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-dex-card/80 to-dex-card/50 backdrop-blur-xl p-8 space-y-6">
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Team Builder</p>
              <h2 className="font-display text-3xl">Squad Architect</h2>
              <p className="text-white/60">
                Assemble up to six Pokémon and monitor coverage before heading into battle.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-sm">
                Slots left: {slotsRemaining}
              </span>
              {team.length > 0 && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-2xl border border-white/15 text-white/80 hover:bg-white/10"
                  onClick={onClear}
                >
                  Reset squad
                </button>
              )}
            </div>
          </header>

          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Quick enlist</label>
            <div className="mt-3">
              <PokemonSuggestInput
                value={nameInput}
                onChange={handleInputChange}
                onSubmit={handleSuggestSubmit}
                placeholder="Type a Pokémon (e.g., tyranitar)"
                buttonLabel={status === 'loading' ? 'Recruiting…' : 'Add to squad'}
                isBusy={status === 'loading' || slotsRemaining === 0}
                suggestions={catalog}
                suggestionsLoading={catalogLoading}
                suggestionsReady={catalogReady}
                suggestionsError={catalogError}
                clearOnSuccess
                className="w-full"
                externalMessage={feedback}
                externalTone={status === 'error' ? 'error' : 'success'}
                onClear={() => {
                  setFeedback(null);
                  resetFeedback();
                }}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {slots.map((member, index) => (
              <motion.div
                key={member ? member.name : `empty-${index}`}
                layout
                className="rounded-3xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3 min-h-[160px]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {member ? (
                  <>
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Operative</p>
                        <p className="text-lg font-semibold capitalize">{member.name}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {member.types.map((type) => (
                            <span key={type} className="px-2 py-1 rounded-full bg-white/10 border border-white/15 text-xs capitalize">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="p-2 rounded-full bg-white/10 border border-white/15 hover:bg-white/20"
                        onClick={() => onRemove(member.name)}
                        aria-label={`Remove ${member.name}`}
                      >
                        <Trash2 className="w-4 h-4 text-white/70" />
                      </button>
                    </div>
                    {member.sprites[0] && (
                      <img
                        src={member.sprites[0]}
                        alt={member.name}
                        className="w-28 h-28 object-contain self-center drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)]"
                      />
                    )}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {member.stats.slice(0, 3).map((stat) => (
                        <div key={stat.label} className="rounded-2xl bg-white/10 border border-white/10 py-2">
                          <p className="uppercase tracking-[0.2em] text-white/50">{stat.label}</p>
                          <p className="text-white font-semibold">{stat.base}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 h-full text-white/40">
                    <Plus className="w-6 h-6" />
                    Slot available
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              icon={<Layers className="w-5 h-5 text-sky-200" />}
              title="Type coverage"
              value={`${metrics.uniqueTypes.length}/18`}
              subtitle={`${Math.round(metrics.coveragePercent * 100)}% of all types`}
            >
              <div className="flex flex-wrap gap-2 mt-3">
                {metrics.uniqueTypes.length ? (
                  metrics.uniqueTypes.map((type) => (
                    <span key={type} className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs capitalize">
                      {type}
                    </span>
                  ))
                ) : (
                  <p className="text-white/50 text-sm">No coverage yet.</p>
                )}
              </div>
            </MetricCard>

            <MetricCard
              icon={<AlertTriangle className="w-5 h-5 text-rose-200" />}
              title="Glaring weaknesses"
              value={metrics.glaringWeaknesses.length ? metrics.glaringWeaknesses.length : '—'}
              subtitle="Types hitting most of your squad"
            >
              <ul className="mt-3 space-y-1 text-sm">
                {metrics.glaringWeaknesses.length ? (
                  metrics.glaringWeaknesses.map((entry) => (
                    <li key={entry.type} className="flex justify-between capitalize">
                      <span>{entry.type}</span>
                      <span>{entry.affected} exposed</span>
                    </li>
                  ))
                ) : (
                  <p className="text-white/50">All clear for now.</p>
                )}
              </ul>
            </MetricCard>

            <MetricCard
              icon={<Shield className="w-5 h-5 text-emerald-200" />}
              title="Resilience"
              value={metrics.sturdyResistances.length ? metrics.sturdyResistances[0].protectors : '—'}
              subtitle="Best-covered attack type"
            >
              <ul className="mt-3 space-y-1 text-sm">
                {metrics.sturdyResistances.length ? (
                  metrics.sturdyResistances.map((entry) => (
                    <li key={entry.type} className="flex justify-between capitalize">
                      <span>{entry.type}</span>
                      <span>{entry.protectors} resist</span>
                    </li>
                  ))
                ) : (
                  <p className="text-white/50">No resist data yet.</p>
                )}
              </ul>
            </MetricCard>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <Users className="w-5 h-5 text-amber-200" />
              Average base stat total
            </div>
            <p className="text-4xl font-bold text-white">{metrics.averageBaseTotal || '—'}</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const MetricCard = ({
  icon,
  title,
  value,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: string;
  value: ReactNode;
  subtitle: string;
  children: ReactNode;
}) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
    <div className="flex items-center gap-2 text-lg font-semibold">
      <span className="p-2 rounded-xl bg-white/10">{icon}</span>
      {title}
    </div>
    <div className="text-3xl font-bold text-white mt-3">{value}</div>
    <p className="text-sm text-white/60">{subtitle}</p>
    {children}
  </div>
);
