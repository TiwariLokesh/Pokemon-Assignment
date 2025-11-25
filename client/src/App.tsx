import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { SearchBar } from './components/SearchBar';
import { PokemonCard } from './components/PokemonCard';
import { LoadingCard } from './components/LoadingCard';
import { usePokemonSearch } from './hooks/usePokemonSearch';

const spotlightPokemon = ['pikachu', 'charizard', 'gengar', 'greninja', 'garchomp'];

const gradientOrbs = [
  { size: 320, top: '5%', left: '10%', color: 'from-rose-500/40 to-orange-400/30' },
  { size: 260, top: '30%', left: '70%', color: 'from-sky-500/40 to-indigo-400/30' },
  { size: 200, top: '65%', left: '20%', color: 'from-emerald-500/30 to-cyan-400/20' },
];

type HeroBadgeProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string;
};

const HeroBadge = ({ label, ...buttonProps }: HeroBadgeProps) => (
  <button
    className="px-4 py-2 rounded-2xl bg-white/10 border border-white/15 capitalize hover:bg-white/20 transition"
    {...buttonProps}
  >
    {label}
  </button>
);

const App = () => {
  const { data, error, status, search } = usePokemonSearch();
  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(31,64,104,.4),_transparent)]" />
      {gradientOrbs.map((orb) => (
        <motion.div
          key={orb.top}
          className={`absolute blur-3xl bg-gradient-to-br ${orb.color} rounded-full opacity-70`}
          style={{ width: orb.size, height: orb.size, top: orb.top, left: orb.left }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      <main className="relative z-10 px-4 sm:px-8 lg:px-16 py-12 flex flex-col items-center gap-10">
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm uppercase tracking-[0.6em] text-white/50">Project NovaDex</p>
          <h1 className="font-display text-5xl md:text-6xl">Pokémon Intelligence Console</h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Hyper-fast, cache-backed scouting intel for any Pokémon. Search by name to pull rich lore,
            vitals, and battle-ready analytics with cinematic flair.
          </p>
        </motion.div>

        <SearchBar onSearch={search} isLoading={isLoading} />

        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {spotlightPokemon.map((name) => (
            <HeroBadge key={name} label={name} onClick={() => search(name)} />
          ))}
        </motion.div>

        {status === 'idle' && (
          <motion.div
            className="text-center text-white/60 max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Sparkles className="mx-auto mb-4 w-8 h-8 text-amber-300" />
            <p>
              Summon a Pokémon to begin. Cached responses keep everything instant, so feel free to
              explore your entire roster.
            </p>
          </motion.div>
        )}

        {isLoading && !data && <LoadingCard />}

        {error && (
          <motion.div
            className="text-center text-rose-200 bg-rose-500/10 border border-rose-400/30 px-6 py-4 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {data && <PokemonCard data={data} />}
      </main>
    </div>
  );
};

export default App;
