import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Clock, Trash, MagnifyingGlass } from '@phosphor-icons/react'
import type { RecentSearch, FilterPresetContext } from '@/lib/types'
import { generateId } from '@/lib/data'

interface RecentSearchesDropdownProps {
  context: FilterPresetContext
  searches: RecentSearch[]
  onSelectSearch: (query: string) => void
  onClearSearches: () => void
  onRemoveSearch: (searchId: string) => void
  currentQuery: string
  onQueryChange: (query: string) => void
}

export function RecentSearchesDropdown({
  context,
  searches,
  onSelectSearch,
  onClearSearches,
  onRemoveSearch,
  currentQuery,
  onQueryChange,
}: RecentSearchesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const contextSearches = searches
    .filter(s => s.context === context)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
  
  const handleSelectSearch = (query: string) => {
    onSelectSearch(query)
    setIsOpen(false)
  }
  
  const handleRemoveSearch = (searchId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onRemoveSearch(searchId)
  }
  
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Clear all recent searches?')) {
      onClearSearches()
    }
  }
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }
  
  if (contextSearches.length === 0) return null
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <Clock size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Recent Searches</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleClearAll}
          >
            Clear all
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-80 overflow-y-auto">
          {contextSearches.map((search) => (
            <DropdownMenuItem
              key={search.id}
              className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer"
              onClick={() => handleSelectSearch(search.query)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MagnifyingGlass size={14} className="flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{search.query}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(search.timestamp)}
                    {search.resultsCount !== undefined && (
                      <> · {search.resultsCount} result{search.resultsCount !== 1 ? 's' : ''}</>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => handleRemoveSearch(search.id, e)}
              >
                <Trash size={14} />
              </Button>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function useRecentSearches(
  context: FilterPresetContext,
  searches: RecentSearch[],
  onAddSearch: (search: RecentSearch) => void
) {
  const recordSearch = (query: string, resultsCount?: number) => {
    if (!query.trim()) return
    
    const existingSearch = searches.find(
      s => s.context === context && s.query.toLowerCase() === query.toLowerCase()
    )
    
    if (existingSearch) {
      return
    }
    
    const newSearch: RecentSearch = {
      id: generateId('rs'),
      query: query.trim(),
      context,
      timestamp: new Date().toISOString(),
      resultsCount,
    }
    
    onAddSearch(newSearch)
  }
  
  return { recordSearch }
}
