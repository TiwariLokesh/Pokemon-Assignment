import { Loader2, Search, X } from 'lucide-react'
import clsx from 'clsx'
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

const MAX_VISIBLE = 8

type Tone = 'error' | 'success' | 'info'

interface PokemonSuggestInputProps {
  value: string
  onChange: (next: string) => void
  onSubmit: (normalized: string) => Promise<boolean> | boolean
  placeholder?: string
  buttonLabel?: string
  isBusy?: boolean
  suggestions: string[]
  suggestionsLoading: boolean
  suggestionsReady: boolean
  suggestionsError?: string | null
  allowEmpty?: boolean
  enforceCatalog?: boolean
  clearOnSuccess?: boolean
  className?: string
  externalMessage?: string | null
  externalTone?: Tone
  onClear?: () => void
}

export const PokemonSuggestInput = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type a Pokémon name',
  buttonLabel = 'Submit',
  isBusy = false,
  suggestions,
  suggestionsLoading,
  suggestionsReady,
  suggestionsError,
  allowEmpty = false,
  enforceCatalog = true,
  clearOnSuccess = false,
  className,
  externalMessage,
  externalTone = 'info',
  onClear
}: PokemonSuggestInputProps) => {
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
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
      .filter(
        (item) =>
          item.value.includes(normalized) ||
          item.label.toLowerCase().includes(normalized.replace(/-/g, ' '))
      )
      .slice(0, MAX_VISIBLE)
  }, [suggestionEntries, value])

  const validateName = (normalized: string) => {
    if (!normalized) return false
    if (!enforceCatalog) return true
    return suggestionsReady ? suggestions.includes(normalized) : normalized.length > 0
  }

  const handleSuggestionClick = (name: string) => {
    setInlineError(null)
    onChange(formatPokemonLabel(name))
    setShowSuggestions(false)
  }

  const handleFocus = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current)
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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInlineError(null)
    onChange(event.target.value)
  }

  const handleClear = () => {
    setInlineError(null)
    onChange('')
    onClear?.()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const normalized = normalizePokemonName(value)

    if (!normalized) {
      if (allowEmpty) {
        const result = await onSubmit('')
        if (result && clearOnSuccess) handleClear()
        return
      }
      setInlineError('Type a Pokémon name to continue.')
      return
    }

    if (!validateName(normalized)) {
      setInlineError('Aisa koi Pokémon nahi hai.')
      return
    }

    const result = await onSubmit(normalized)
    if (result && clearOnSuccess) handleClear()
  }

  useEffect(() => () => {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current)
    }
  }, [])

  const hasValue = value.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className={clsx('relative', className)}>
      <div className="glow-border">
        <div className="relative bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-white/60" />
            <input
              type="text"
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-base placeholder-white/40 capitalize"
              placeholder={placeholder}
              autoComplete="off"
              spellCheck={false}
            />
            {hasValue && (
              <button
                type="button"
                className="p-2 rounded-2xl text-white/60 hover:text-white/90"
                onClick={handleClear}
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-300 text-sm font-semibold disabled:opacity-60"
              disabled={isBusy}
            >
              {isBusy ? 'Loading…' : buttonLabel}
            </button>
          </div>
          {inlineError && <p className="text-rose-200 text-sm mt-2">{inlineError}</p>}
          {externalMessage && !inlineError && (
            <p
              className={clsx('text-sm mt-2', {
                'text-rose-200': externalTone === 'error',
                'text-emerald-200': externalTone === 'success',
                'text-white/70': externalTone === 'info'
              })}
            >
              {externalMessage}
            </p>
          )}
        </div>
        {showSuggestions && (
          <div className="absolute left-0 right-0 mt-2 z-10">
            <div className="bg-dex-card/95 border border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-xl">
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
                        className="w-full text-left px-3 py-2 rounded-2xl hover:bg-white/10 capitalize"
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
    </form>
  )
}
