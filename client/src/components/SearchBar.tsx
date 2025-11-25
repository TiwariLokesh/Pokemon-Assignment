import { motion } from 'framer-motion'
import { Loader2, Search, X } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent
} from 'react'
import { formatPokemonLabel, normalizePokemonName } from '../utils/pokemon'

interface SearchBarProps {
  onSearch: (name: string) => void
  isLoading: boolean
  suggestions: string[]
  suggestionsLoading: boolean
  suggestionsReady: boolean
  suggestionsError?: string | null
}

const placeholders = ['pikachu', 'charizard', 'gardevoir', 'lucario']
const MAX_VISIBLE = 8

export const SearchBar = ({
  onSearch,
  isLoading,
  suggestions,
  suggestionsLoading,
  suggestionsReady,
  suggestionsError,
}: SearchBarProps) => {
  const [value, setValue] = useState('')
  const [placeholder] = useState(() =>
    placeholders[Math.floor(Math.random() * placeholders.length)]
  )
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const suggestionEntries = useMemo(
    () =>
      suggestions.map((name) => ({
        value: name,
        label: formatPokemonLabel(name)
      })),
    [suggestions]
  )

  const filteredSuggestions = useMemo(() => {
    const normalized = normalizePokemonName(value)
    if (!normalized) {
      return suggestionEntries.slice(0, MAX_VISIBLE)
    }
    return suggestionEntries
      .filter((item) => item.value.includes(normalized) || item.label.toLowerCase().includes(normalized.replace(/-/g, ' ')))
      .slice(0, MAX_VISIBLE)
  }, [suggestionEntries, value])

  const validateName = (normalized: string) =>
    suggestionsReady ? suggestions.includes(normalized) : normalized.length > 0

  const triggerSearch = (normalized: string) => {
    setValue(formatPokemonLabel(normalized))
    setInlineError(null)
    setShowSuggestions(false)
    onSearch(normalized)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const normalized = normalizePokemonName(value)
    if (!normalized) {
      setInlineError('Type a Pokemon name to search.')
      return
    }

    if (!validateName(normalized)) {
      setInlineError('Aisa koi Pokemon nahi hai.')
      return
    }

    triggerSearch(normalized)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    setInlineError(null)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (name: string) => {
    triggerSearch(name)
  }

  const handleFocus = () => {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current)
    }
    setShowSuggestions(true)
  }

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setShowSuggestions(false), 120)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setShowSuggestions(false)
      setInlineError(null)
    }
  }

  const handleClear = () => {
    setValue('')
    setInlineError(null)
    setShowSuggestions(false)
    onSearch('')
  }

  useEffect(
    () => () => {
      if (blurTimeout.current) {
        clearTimeout(blurTimeout.current)
      }
    },
    []
  )

  const hasValue = value.trim().length > 0

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
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={`Search for ${placeholder}`}
            />
            {hasValue && (
              <button
                type="button"
                className="p-2 rounded-2xl text-white/60 hover:text-white/90"
                onClick={handleClear}
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <motion.button
              type="submit"
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 font-semibold"
              whileTap={{ scale: 0.96 }}
              disabled={isLoading}
            >
              {isLoading ? 'Scanning…' : 'Search'}
            </motion.button>
          </div>
          {inlineError && (
            <p className="text-rose-200 text-sm mt-3">{inlineError}</p>
          )}
        </div>
        {showSuggestions && (
          <div className="absolute left-0 right-0 mt-3 z-20">
            <div className="bg-dex-card/95 border border-white/10 rounded-3xl p-4 shadow-2xl backdrop-blur-xl">
              {suggestionsError ? (
                <p className="text-sm text-rose-200">{suggestionsError}</p>
              ) : suggestionsLoading ? (
                <div className="flex items-center gap-3 text-white/70">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading Pokédex catalog…
                </div>
              ) : filteredSuggestions.length > 0 ? (
                <ul className="flex flex-col">
                  {filteredSuggestions.map((item) => (
                    <li key={item.value}>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 rounded-2xl hover:bg-white/10 capitalize"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSuggestionClick(item.value)}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/60">No matching Pokémon yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.form>
  );
};
