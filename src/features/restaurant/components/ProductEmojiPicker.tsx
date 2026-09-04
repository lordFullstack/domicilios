const EMOJI_OPTIONS = [
  '🍕', '🍔', '🍣', '🍗', '🍟', '🌮', '🍝', '🥗',
  '🍰', '🥤', '🍺', '☕', '🍦', '🥪', '🍤', '🍜',
]

interface ProductEmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export const ProductEmojiPicker = ({ value, onChange }: ProductEmojiPickerProps) => (
  <div className="flex flex-wrap gap-2">
    {EMOJI_OPTIONS.map((emoji) => (
      <button
        key={emoji}
        type="button"
        onClick={() => onChange(emoji)}
        className={`focus-ring w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 transition-all active:scale-90 ${
          value === emoji ? 'border-primary bg-primary/10' : 'border-gray-100 hover:border-gray-200'
        }`}
      >
        {emoji}
      </button>
    ))}
  </div>
)
