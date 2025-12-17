import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Keyboard } from '@phosphor-icons/react'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['⌘', '1'], description: 'Go to Home' },
        { keys: ['⌘', '2'], description: 'Go to Quotes' },
        { keys: ['⌘', '3'], description: 'Go to Jobs' },
        { keys: ['⌘', '4'], description: 'Go to Customers' },
        { keys: ['⌘', '5'], description: 'Go to Reports' },
        { keys: ['⌘', '6'], description: 'Go to Settings' },
      ],
    },
    {
      category: 'Actions',
      items: [
        { keys: ['⌘', 'N'], description: 'New Quote / Job / Customer (context-aware)' },
        { keys: ['⌘', 'S'], description: 'Save Quote (when in Quote Builder)' },
        { keys: ['⌘', 'K'], description: 'Focus search' },
        { keys: ['Esc'], description: 'Close detail view or go back' },
        { keys: ['?'], description: 'Show keyboard shortcuts' },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard size={24} className="text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                  >
                    <span className="text-sm">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs font-semibold bg-secondary text-secondary-foreground rounded border border-border shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < item.keys.length - 1 && (
                            <span className="text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-secondary rounded">?</kbd> anytime to see these shortcuts
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
