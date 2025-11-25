import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (name: string) => void;
  isLoading: boolean;
}

const placeholders = ['pikachu', 'charizard', 'gardevoir', 'lucario'];

export const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [value, setValue] = useState('');
  const [placeholder] = useState(() =>
    placeholders[Math.floor(Math.random() * placeholders.length)],
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(value);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="glow-border">
        <div className="relative bg-dex-card/70 backdrop-blur-md rounded-3xl px-6 py-4 border border-white/5">
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-white/60" />
            <input
              className="flex-1 bg-transparent outline-none text-lg placeholder-white/35"
              type="search"
              autoComplete="off"
              spellCheck={false}
              value={value}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
              placeholder={`Search for ${placeholder}`}
            />
            <motion.button
              type="submit"
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 font-semibold"
              whileTap={{ scale: 0.96 }}
              disabled={isLoading}
            >
              {isLoading ? 'Scanning…' : 'Search'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.form>
  );
};
