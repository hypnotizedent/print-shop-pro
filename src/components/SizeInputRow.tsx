import { Input } from '@/components/ui/input'
import type { Sizes } from '@/lib/types'

interface SizeInputRowProps {
  sizes: Sizes
  onChange: (sizes: Sizes) => void
  disabled?: boolean
}

const sizeOrder: (keyof Sizes)[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

export function SizeInputRow({ sizes, onChange, disabled }: SizeInputRowProps) {
  const handleSizeChange = (size: keyof Sizes, value: number) => {
    onChange({
      ...sizes,
      [size]: Math.max(0, value),
    })
  }
  
  return (
    <div className="flex gap-2 items-center">
      {sizeOrder.map((size) => (
        <div key={size} className="flex flex-col items-center">
          <label className="text-xs text-muted-foreground mb-1 font-medium">
            {size}
          </label>
          <Input
            type="number"
            min="0"
            value={sizes[size]}
            onChange={(e) => handleSizeChange(size, Number(e.target.value))}
            disabled={disabled}
            className="w-14 h-9 text-center tabular-nums p-1"
          />
        </div>
      ))}
    </div>
  )
}
