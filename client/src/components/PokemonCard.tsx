import { motion } from 'framer-motion';
import { Flame, Ruler, Weight, Star, Sparkles, Info, Trophy } from 'lucide-react';
import type { PokemonData } from '../types';
import { StatMeter } from './StatMeter';
import { AttributeGrid } from './AttributeGrid';

const typeGradients: Record<string, string> = {
  fire: 'from-orange-400 via-red-500 to-rose-500',
  water: 'from-sky-400 via-blue-500 to-indigo-500',
  grass: 'from-emerald-400 via-lime-400 to-amber-300',
  electric: 'from-amber-400 via-yellow-300 to-orange-400',
  psychic: 'from-pink-400 via-fuchsia-500 to-purple-500',
  dragon: 'from-fuchsia-500 via-violet-500 to-sky-400',
  fairy: 'from-rose-300 via-pink-300 to-amber-200',
  dark: 'from-slate-700 via-slate-900 to-black',
  default: 'from-cyan-400 via-blue-500 to-indigo-500',
};

const formatNumber = (value: number) => value.toLocaleString();

interface PokemonCardProps {
  data: PokemonData;
  onAddToTeam?: (pokemon: PokemonData) => void;
  isInTeam?: boolean;
  canAdd?: boolean;
}

export const PokemonCard = ({ data, onAddToTeam, isInTeam = false, canAdd = true }: PokemonCardProps) => {
  const gradient = typeGradients[data.types[0]] ?? typeGradients.default;
  const heroSprite = data.sprites[0];
  const addLabel = isInTeam ? 'Already in squad' : canAdd ? 'Add to squad' : 'Squad full';

  return (
    <motion.section
      layout
      className="relative w-full max-w-5xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 14 }}
    >
      <div className="glow-border">
        <div className="bg-gradient-to-br from-dex-card/90 to-dex-card/60 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-xl">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="uppercase tracking-[0.4em] text-xs text-white/50">#{data.id}</p>
                  <h1 className="font-display text-4xl md:text-5xl capitalize">{data.name}</h1>
                  {data.genera && <p className="text-white/60">{data.genera}</p>}
                </div>
                <div className="flex gap-3">
                  {data.types.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 rounded-full text-sm bg-white/10 border border-white/15 capitalize"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {onAddToTeam && (
                <button
                  className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-100 font-semibold disabled:opacity-60"
                  disabled={isInTeam || !canAdd}
                  onClick={() => onAddToTeam(data)}
                >
                  {addLabel}
                </button>
              )}

              {data.flavorText && (
                <p className="text-white/70 text-lg leading-relaxed">
                  “{data.flavorText}”
                </p>
              )}

              <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10">
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-30`} />
                {heroSprite && (
                  <motion.img
                    src={heroSprite}
                    alt={data.name}
                    className="w-full max-h-80 object-contain relative z-10 drop-shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                  />
                )}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40"
                  animate={{ opacity: [0.4, 0.2, 0.4] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <AttributeChip icon={<Ruler />} label="Height" value={`${data.height.toFixed(1)} m`} />
                <AttributeChip icon={<Weight />} label="Weight" value={`${data.weight.toFixed(1)} kg`} />
                <AttributeChip icon={<Flame />} label="Base Exp." value={formatNumber(data.baseExperience)} />
              </div>

              <div className="rounded-3xl border border-white/10 p-6 bg-white/5 space-y-4">
                <h2 className="font-display text-2xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />Abilities
                </h2>
                <div className="flex flex-wrap gap-3">
                  {data.abilities.map((ability) => (
                    <span
                      key={ability.name}
                      className="px-4 py-2 rounded-2xl bg-white/10 border border-white/15 capitalize"
                    >
                      {ability.name}
                      {ability.hidden && <small className="ml-2 text-amber-300">hidden</small>}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 p-6 bg-white/5">
                <h2 className="font-display text-2xl flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-sky-300" />Vitals
                </h2>
                <AttributeGrid
                  items={[
                    { label: 'Habitat', value: data.habitat },
                    { label: 'Shape', value: data.shape },
                    { label: 'Growth Rate', value: data.growthRate ?? 'unknown' },
                    { label: 'Capture Rate', value: `${data.captureRate}` },
                    { label: 'Egg Groups', value: data.eggGroups.join(', ') || '—' },
                    { label: 'Moves Sample', value: data.movesSample.join(', ') },
                  ]}
                />
              </div>

              <div className="rounded-3xl border border-white/10 p-6 bg-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-300" />Battle stats
                </div>
                <div className="space-y-3">
                  {data.stats.map((stat) => (
                    <StatMeter key={stat.label} label={stat.label} value={stat.base} />
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 p-6 bg-gradient-to-br from-white/10 to-transparent">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Trophy className="w-5 h-5 text-rose-300" />Status
                </div>
                <div className="flex gap-3 mt-4">
                  {data.legendary && <StatusBadge label="Legendary" />}
                  {data.mythical && <StatusBadge label="Mythical" />}
                  {!data.legendary && !data.mythical && <StatusBadge label="Battle ready" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const AttributeChip = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-white/10 px-4 py-3 bg-white/5 flex items-center gap-3">
    <div className="p-2 rounded-xl bg-white/10 text-amber-200">{icon}</div>
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ label }: { label: string }) => (
  <span className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-sm uppercase tracking-[0.2em]">
    {label}
  </span>
);
