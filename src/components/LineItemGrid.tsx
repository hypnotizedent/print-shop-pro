import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductMockupWithSize } from './ProductMockupWithSize'
import { DecorationManager } from './DecorationManager'
import { CopyDecorationsDialog } from './CopyDecorationsDialog'
import { BulkCopyDecorationsDialog } from './BulkCopyDecorationsDialog'
import { InlineSKUSearch } from './InlineSKUSearch'
import { Trash, CaretDown, CaretRight, Copy, Clock, CopySimple, DotsSixVertical, FolderOpen, Folder, Plus, ArrowsOutCardinal, ArrowsInCardinal, DotsThree } from '@phosphor-icons/react'
import type { LineItem, Sizes, Decoration, Quote, CustomerDecorationTemplate, CustomerArtworkFile, LineItemGroup } from '@/lib/types'
import { calculateSizesTotal, calculateLineItemTotal } from '@/lib/data'
import { generateId } from '@/lib/data'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface LineItemGridProps {
  items: LineItem[]
  groups?: LineItemGroup[]
  onChange: (items: LineItem[]) => void
  onGroupsChange?: (groups: LineItemGroup[]) => void
  customerId?: string
  customerName?: string
  previousQuotes?: Quote[]
  customerTemplates?: CustomerDecorationTemplate[]
  customerArtworkFiles?: CustomerArtworkFile[]
  onSaveTemplate?: (template: CustomerDecorationTemplate) => void
  onAddImprint?: (itemId: string) => void
}

export function LineItemGrid({ 
  items, 
  groups = [],
  onChange, 
  onGroupsChange,
  customerId, 
  customerName, 
  previousQuotes,
  customerTemplates = [],
  customerArtworkFiles = [],
  onSaveTemplate,
  onAddImprint,
}: LineItemGridProps) {
  const [expandedLocations, setExpandedLocations] = React.useState<Set<string>>(new Set())
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set())
  const [copyDialogOpen, setCopyDialogOpen] = React.useState(false)
  const [bulkCopyDialogOpen, setBulkCopyDialogOpen] = React.useState(false)
  const [currentItemIndex, setCurrentItemIndex] = React.useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)
  const [draggedGroupIndex, setDraggedGroupIndex] = React.useState<number | null>(null)
  const [dragOverGroupIndex, setDragOverGroupIndex] = React.useState<number | null>(null)

  const updateItem = (index: number, updates: Partial<LineItem>) => {
    const newItems = [...items]
    const item = { ...newItems[index], ...updates }
    
    if (updates.sizes) {
      item.quantity = calculateSizesTotal(updates.sizes)
    }
    
    item.line_total = calculateLineItemTotal(item)
    
    newItems[index] = item
    onChange(newItems)
  }
  
  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const duplicateItem = (index: number) => {
    const itemToDuplicate = items[index]
    const duplicatedItem: LineItem = {
      ...itemToDuplicate,
      id: generateId('li'),
      decorations: itemToDuplicate.decorations?.map(dec => ({
        ...dec,
        id: generateId('dec'),
      }))
    }
    const newItems = [...items]
    newItems.splice(index + 1, 0, duplicatedItem)
    onChange(newItems)
    toast.success('Line item duplicated')
  }

  const toggleLocationsSection = (itemId: string) => {
    setExpandedLocations(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const handleDecorationsChange = (index: number, decorations: Decoration[]) => {
    updateItem(index, { decorations })
  }

  const handleSizeChange = (index: number, size: keyof Sizes, value: number) => {
    const item = items[index]
    const newSizes = { ...item.sizes, [size]: value }
    updateItem(index, { sizes: newSizes })
  }

  const getTotalDecorations = (item: LineItem): number => {
    return (item.decorations || []).length
  }

  const getTotalSetupFees = (item: LineItem): number => {
    return (item.decorations || []).reduce((sum, dec) => sum + dec.setupFee, 0)
  }

  const copyDecorationsFromItem = (targetIndex: number, sourceIndex: number) => {
    const sourceItem = items[sourceIndex]
    const sourceDecorations = sourceItem.decorations || []
    
    if (sourceDecorations.length === 0) {
      toast.error('No decorations to copy from this item')
      return
    }

    const copiedDecorations = sourceDecorations.map(decoration => ({
      ...decoration,
      id: generateId('dec'),
      artwork: decoration.artwork ? {
        ...decoration.artwork,
      } : undefined,
    }))

    const targetItem = items[targetIndex]
    const existingDecorations = targetItem.decorations || []
    const mergedDecorations = [...existingDecorations, ...copiedDecorations]

    updateItem(targetIndex, { decorations: mergedDecorations })
    
    toast.success(`Copied ${copiedDecorations.length} decoration${copiedDecorations.length !== 1 ? 's' : ''} from line item ${sourceIndex + 1}`)
  }

  const handleCopyFromPreviousQuotes = (itemIndex: number) => {
    setCurrentItemIndex(itemIndex)
    setCopyDialogOpen(true)
  }

  const handleCopyDecorationsFromDialog = (decorations: Decoration[]) => {
    if (currentItemIndex === null) return

    const targetItem = items[currentItemIndex]
    const existingDecorations = targetItem.decorations || []
    const mergedDecorations = [...existingDecorations, ...decorations]

    updateItem(currentItemIndex, { decorations: mergedDecorations })
  }

  const handleBulkCopyToAllItems = (itemIndex: number) => {
    setCurrentItemIndex(itemIndex)
    setBulkCopyDialogOpen(true)
  }

  const handleBulkCopyDecorations = (targetLineItemIds: string[], decorations: Decoration[]) => {
    const newItems = items.map(item => {
      if (targetLineItemIds.includes(item.id)) {
        return {
          ...item,
          decorations,
        }
      }
      return item
    })
    onChange(newItems)
  }

  const handleApplySKUData = (index: number, productName: string, color: string, sizes: Partial<Sizes>) => {
    const fullSizes: Sizes = {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      '2XL': 0,
      '3XL': 0,
      ...sizes
    }

    updateItem(index, {
      product_name: productName,
      product_color: color,
      sizes: fullSizes
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newItems = [...items]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(dropIndex, 0, draggedItem)
    
    onChange(newItems)
    toast.success('Line item reordered')
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const createGroup = (itemIds: string[]) => {
    if (!onGroupsChange) return
    
    const newGroup: LineItemGroup = {
      id: generateId('grp'),
      name: `Group ${groups.length + 1}`,
      decorations: [],
      collapsed: false,
    }
    
    const newItems = items.map(item => 
      itemIds.includes(item.id) ? { ...item, groupId: newGroup.id } : item
    )
    
    onChange(newItems)
    onGroupsChange([...groups, newGroup])
    toast.success(`Created group with ${itemIds.length} item${itemIds.length !== 1 ? 's' : ''}`)
  }

  const removeFromGroup = (itemId: string) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, groupId: undefined } : item
    )
    onChange(newItems)
    toast.success('Item removed from group')
  }

  const addItemToGroup = (itemId: string, groupId: string) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, groupId } : item
    )
    onChange(newItems)
    toast.success('Item added to group')
  }

  const deleteGroup = (groupId: string) => {
    if (!onGroupsChange) return
    
    const newItems = items.map(item =>
      item.groupId === groupId ? { ...item, groupId: undefined } : item
    )
    const newGroups = groups.filter(g => g.id !== groupId)
    
    onChange(newItems)
    onGroupsChange(newGroups)
    toast.success('Group deleted')
  }

  const updateGroup = (groupId: string, updates: Partial<LineItemGroup>) => {
    if (!onGroupsChange) return
    
    const newGroups = groups.map(g =>
      g.id === groupId ? { ...g, ...updates } : g
    )
    onGroupsChange(newGroups)
  }

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const applyGroupDecorationsToItem = (itemId: string, groupId: string) => {
    const group = groups.find(g => g.id === groupId)
    if (!group || group.decorations.length === 0) return
    
    const copiedDecorations = group.decorations.map(decoration => ({
      ...decoration,
      id: generateId('dec'),
    }))
    
    const newItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          decorations: copiedDecorations,
        }
      }
      return item
    })
    
    onChange(newItems)
    toast.success('Group decorations applied to item')
  }

  const updateGroupDecorationsFromItem = (itemId: string, groupId: string) => {
    if (!onGroupsChange) return
    
    const item = items.find(i => i.id === itemId)
    if (!item || !item.decorations || item.decorations.length === 0) return
    
    const copiedDecorations = item.decorations.map(decoration => ({
      ...decoration,
      id: generateId('dec'),
    }))
    
    updateGroup(groupId, { decorations: copiedDecorations })
    toast.success('Group decorations updated from item')
  }

  const moveItemBetweenGroups = (itemId: string, fromGroupId: string | undefined, toGroupId: string) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, groupId: toGroupId } : item
    )
    onChange(newItems)
    toast.success('Item moved to new group')
  }

  const handleDragGroupStart = (index: number) => {
    setDraggedGroupIndex(index)
  }

  const handleDragGroupOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedGroupIndex !== null && draggedGroupIndex !== index) {
      setDragOverGroupIndex(index)
    }
  }

  const handleDragGroupLeave = () => {
    setDragOverGroupIndex(null)
  }

  const handleDropGroup = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (!onGroupsChange || draggedGroupIndex === null || draggedGroupIndex === dropIndex) {
      setDraggedGroupIndex(null)
      setDragOverGroupIndex(null)
      return
    }

    const newGroups = [...groups]
    const [draggedGroup] = newGroups.splice(draggedGroupIndex, 1)
    newGroups.splice(dropIndex, 0, draggedGroup)
    
    onGroupsChange(newGroups)
    toast.success('Group reordered')
    
    setDraggedGroupIndex(null)
    setDragOverGroupIndex(null)
  }

  const handleDragGroupEnd = () => {
    setDraggedGroupIndex(null)
    setDragOverGroupIndex(null)
  }

  const duplicateImprint = (itemIndex: number, decorationIndex: number) => {
    const item = items[itemIndex]
    if (!item.decorations) return
    
    const decorationToDuplicate = item.decorations[decorationIndex]
    const duplicatedDecoration: Decoration = {
      ...decorationToDuplicate,
      id: generateId('dec'),
    }
    
    const newDecorations = [...item.decorations]
    newDecorations.splice(decorationIndex + 1, 0, duplicatedDecoration)
    
    updateItem(itemIndex, { decorations: newDecorations })
    toast.success('Imprint duplicated')
  }

  const moveImprintToItem = (fromItemIndex: number, decorationIndex: number, toItemIndex: number) => {
    const fromItem = items[fromItemIndex]
    if (!fromItem.decorations) return
    
    const decorationToMove = fromItem.decorations[decorationIndex]
    const movedDecoration: Decoration = {
      ...decorationToMove,
      id: generateId('dec'),
    }
    
    const newFromDecorations = fromItem.decorations.filter((_, i) => i !== decorationIndex)
    const toItem = items[toItemIndex]
    const newToDecorations = [...(toItem.decorations || []), movedDecoration]
    
    const newItems = [...items]
    newItems[fromItemIndex] = { ...fromItem, decorations: newFromDecorations }
    newItems[toItemIndex] = { ...toItem, decorations: newToDecorations }
    
    onChange(newItems)
    toast.success('Imprint moved to different item')
  }

  const copyImprintToItem = (fromItemIndex: number, decorationIndex: number, toItemIndex: number) => {
    const fromItem = items[fromItemIndex]
    if (!fromItem.decorations) return
    
    const decorationToCopy = fromItem.decorations[decorationIndex]
    const copiedDecoration: Decoration = {
      ...decorationToCopy,
      id: generateId('dec'),
    }
    
    const toItem = items[toItemIndex]
    const newToDecorations = [...(toItem.decorations || []), copiedDecoration]
    
    updateItem(toItemIndex, { decorations: newToDecorations })
    toast.success('Imprint copied to item')
  }

  const customerQuotes = previousQuotes?.filter(q => q.customer.id === customerId && q.id !== items[0]?.id) || []
  
  const customerTemplatesForCustomer = customerTemplates.filter(t => t.customerId === customerId)

  const ungroupedItems = items.filter(item => !item.groupId)
  const groupedItemsMap = items.reduce((acc, item) => {
    if (item.groupId) {
      if (!acc[item.groupId]) {
        acc[item.groupId] = []
      }
      acc[item.groupId].push(item)
    }
    return acc
  }, {} as Record<string, LineItem[]>)
  
  const renderLineItem = (item: LineItem, index: number, isInGroup = false, groupId?: string) => {
    const group = groupId ? groups.find(g => g.id === groupId) : undefined
    const hasGroupImprints = group && group.decorations.length > 0 && item.decorations && 
      item.decorations.length >= group.decorations.length &&
      group.decorations.every((groupDec) => 
        item.decorations?.some(itemDec => 
          itemDec.location === groupDec.location &&
          itemDec.method === groupDec.method
        )
      )
    
    return (
      <>
        <tr 
          key={item.id} 
          className={`border-b border-border transition-colors ${
            draggedIndex === index 
              ? 'opacity-40' 
              : dragOverIndex === index
              ? 'bg-primary/10'
              : 'hover:bg-muted/20'
          }`}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
        >
          <td className="px-2 py-2.5">
            <div 
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
              title="Drag to reorder"
            >
              <DotsSixVertical size={16} weight="bold" />
            </div>
          </td>
          <td className="px-3 py-2.5">
            <InlineSKUSearch
              value={item.product_name}
              onApply={(productName, color, sizes) => handleApplySKUData(index, productName, color, sizes)}
              onInputChange={(value) => updateItem(index, { product_name: value })}
            />
          </td>
          <td className="px-3 py-2.5">
            <Input
              value={item.product_color || ''}
              onChange={(e) => updateItem(index, { product_color: e.target.value })}
              placeholder="e.g., Navy"
              className="h-8 border-0 bg-transparent hover:bg-background focus:bg-background px-2"
            />
          </td>
          <td className="px-3 py-2.5">
            <div className="flex gap-1.5 items-center">
              {(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const).map((size) => (
                <div key={size} className="flex flex-col items-center flex-1 min-w-0">
                  <label className="text-[10px] text-muted-foreground mb-0.5 font-medium">
                    {size}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={item.sizes[size]}
                    onChange={(e) => handleSizeChange(index, size, Number(e.target.value))}
                    className="h-7 w-full text-center text-xs tabular-nums border-0 bg-transparent hover:bg-background focus:bg-background px-1"
                  />
                </div>
              ))}
            </div>
          </td>
          <td className="px-3 py-2.5">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-muted-foreground text-xs">$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={item.unit_price}
                onChange={(e) => updateItem(index, { unit_price: Number(e.target.value) })}
                className="h-8 w-20 text-right tabular-nums border-0 bg-transparent hover:bg-background focus:bg-background px-2"
              />
            </div>
          </td>
          <td className="px-3 py-2.5">
            <div className="flex justify-center">
              <ProductMockupWithSize 
                productType={item.product_type} 
                color={item.product_color || '#94a3b8'}
                decorations={item.decorations}
                size="small"
              />
            </div>
          </td>
          <td className="px-2 py-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                >
                  <Copy size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => duplicateItem(index)}>
                  <Copy size={14} className="mr-2" />
                  Duplicate Line Item
                </DropdownMenuItem>
                
                {isInGroup && groupId && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs font-semibold text-primary">
                      Group Actions
                    </div>
                    {item.decorations && item.decorations.length > 0 && (
                      <DropdownMenuItem onClick={() => updateGroupDecorationsFromItem(item.id, groupId)}>
                        <ArrowsInCardinal size={14} className="mr-2" />
                        Save as Group Imprints
                      </DropdownMenuItem>
                    )}
                    {group && group.decorations.length > 0 && (
                      <DropdownMenuItem onClick={() => applyGroupDecorationsToItem(item.id, groupId)}>
                        <CopySimple size={14} className="mr-2" />
                        Apply Group Imprints
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => removeFromGroup(item.id)}>
                      <ArrowsOutCardinal size={14} className="mr-2" />
                      Remove from Group
                    </DropdownMenuItem>
                  </>
                )}
                
                {!isInGroup && groups.length > 0 && onGroupsChange && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      Add to Group
                    </div>
                    {groups.map(g => (
                      <DropdownMenuItem key={g.id} onClick={() => addItemToGroup(item.id, g.id)}>
                        <Folder size={14} className="mr-2" />
                        {g.name}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => removeItem(index)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash size={14} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
        <tr className="border-b border-border bg-muted/10">
          <td colSpan={7} className="px-3 py-0">
            <div className="py-2">
              <button
                onClick={() => toggleLocationsSection(item.id)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                {expandedLocations.has(item.id) ? (
                  <CaretDown size={14} weight="bold" />
                ) : (
                  <CaretRight size={14} weight="bold" />
                )}
                <span className="font-medium">
                  Locations & Decoration
                </span>
                <span className="text-xs">
                  ({getTotalDecorations(item)} imprint{getTotalDecorations(item) !== 1 ? 's' : ''})
                </span>
                {hasGroupImprints && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    <Folder size={10} className="mr-1" weight="fill" />
                    Group Imprints
                  </Badge>
                )}
                {getTotalSetupFees(item) > 0 && (
                  <span className="text-xs text-muted-foreground">
                    • Setup: ${getTotalSetupFees(item).toFixed(2)}
                  </span>
                )}
                <div className="ml-auto text-xs font-bold text-primary tabular-nums">
                  Total: ${item.line_total.toFixed(2)} ({item.quantity} pcs)
                </div>
              </button>
              
              {expandedLocations.has(item.id) && (
                <>
                  {(items.length > 1 || (customerId && customerQuotes.length > 0)) && (
                    <div className="mt-3 mb-3 p-3 bg-muted/30 border border-border rounded-lg">
                      <div className="text-xs font-semibold text-muted-foreground mb-2">
                        QUICK ACTIONS
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {items.length > 1 && (item.decorations || []).length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkCopyToAllItems(index)}
                            className="h-8 text-xs"
                          >
                            <CopySimple size={14} className="mr-1.5" />
                            Apply to All Items
                          </Button>
                        )}

                        {items.length > 1 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                              >
                                <Copy size={14} className="mr-1.5" />
                                Copy From Line Item
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-72">
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                Select line item to copy decorations from
                              </div>
                              <DropdownMenuSeparator />
                              {items.map((sourceItem, sourceIndex) => {
                                if (sourceIndex === index) return null
                                const decorationCount = getTotalDecorations(sourceItem)
                                if (decorationCount === 0) return null
                                
                                return (
                                  <DropdownMenuItem
                                    key={sourceItem.id}
                                    onClick={() => copyDecorationsFromItem(index, sourceIndex)}
                                    className="flex flex-col items-start gap-0.5 py-2"
                                  >
                                    <div className="font-medium text-xs">
                                      #{sourceIndex + 1}: {sourceItem.product_name || 'Untitled'} 
                                      {sourceItem.product_color && ` - ${sourceItem.product_color}`}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {decorationCount} decoration{decorationCount !== 1 ? 's' : ''} • Setup: ${getTotalSetupFees(sourceItem).toFixed(2)}
                                    </div>
                                  </DropdownMenuItem>
                                )
                              }).filter(Boolean).length === 0 && (
                                <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                                  No other line items with decorations
                                </div>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {customerId && customerQuotes.length > 0 && (
                          <Button
                            onClick={() => handleCopyFromPreviousQuotes(index)}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                          >
                            <Clock size={14} className="mr-1.5" />
                            Previous Orders ({customerQuotes.length})
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pb-3">
                    <DecorationManager
                      decorations={item.decorations || []}
                      onChange={(decorations) => handleDecorationsChange(index, decorations)}
                      productType={item.product_type}
                      customerId={customerId}
                      customerName={customerName}
                      customerTemplates={customerTemplatesForCustomer}
                      customerArtworkFiles={customerArtworkFiles}
                      onSaveTemplate={onSaveTemplate}
                      lineItems={items}
                      currentItemIndex={index}
                      onDuplicateImprint={(decorationIndex) => duplicateImprint(index, decorationIndex)}
                      onMoveImprintToItem={(decorationIndex, toItemIndex) => moveImprintToItem(index, decorationIndex, toItemIndex)}
                      onCopyImprintToItem={(decorationIndex, toItemIndex) => copyImprintToItem(index, decorationIndex, toItemIndex)}
                    />
                  </div>
                </>
              )}
            </div>
          </td>
        </tr>
      </>
    )
  }
  
  return (
    <>
      <CopyDecorationsDialog
        open={copyDialogOpen}
        onOpenChange={setCopyDialogOpen}
        customerId={customerId || ''}
        customerName={customerName || 'Customer'}
        previousQuotes={customerQuotes}
        onCopyDecorations={handleCopyDecorationsFromDialog}
      />

      {currentItemIndex !== null && (
        <BulkCopyDecorationsDialog
          open={bulkCopyDialogOpen}
          onOpenChange={setBulkCopyDialogOpen}
          sourceLineItem={items[currentItemIndex]}
          allLineItems={items}
          onCopy={handleBulkCopyDecorations}
        />
      )}

      {onGroupsChange && (
        <div className="mb-4 space-y-3">
          {ungroupedItems.length > 1 && (
            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground mb-1">
                  Organize Items into Groups
                </div>
                <div className="text-xs text-muted-foreground">
                  Group similar SKUs together to manage imprints centrally. Define decorations once and apply to all items in the group.
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const selectedIds = ungroupedItems.slice(0, Math.min(2, ungroupedItems.length)).map(i => i.id)
                  createGroup(selectedIds)
                }}
                className="ml-4"
              >
                <FolderOpen size={16} className="mr-2" />
                Create New Group
              </Button>
            </div>
          )}
          
          {groups.length > 0 && ungroupedItems.length > 0 && (
            <div className="p-3 bg-muted/20 border border-border rounded-lg">
              <div className="text-xs font-semibold text-muted-foreground mb-2">
                QUICK ACTIONS
              </div>
              <div className="flex flex-wrap gap-2">
                {groups.map(g => {
                  const groupItems = items.filter(item => item.groupId === g.id)
                  return (
                    <Button
                      key={g.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (ungroupedItems.length > 0) {
                          addItemToGroup(ungroupedItems[0].id, g.id)
                        }
                      }}
                      className="h-8 text-xs"
                    >
                      <Folder size={12} className="mr-1.5" weight="fill" />
                      Add to "{g.name}" ({groupItems.length})
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="w-8"></th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2 w-[28%]">
                PRODUCT STYLE
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2 w-[12%]">
                COLOR
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2 w-[33%]">
                SIZES
              </th>
              <th className="text-right text-xs font-semibold text-muted-foreground px-3 py-2 w-[15%]">
                PRICE
              </th>
              <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2 w-[8%]">
                PREVIEW
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, groupIndex) => {
              const groupItems = groupedItemsMap[group.id] || []
              const isGroupCollapsed = collapsedGroups.has(group.id)
              
              return (
                <React.Fragment key={group.id}>
                  <tr 
                    className={`bg-primary/10 border-b-2 border-primary/30 ${
                      draggedGroupIndex === groupIndex 
                        ? 'opacity-40' 
                        : dragOverGroupIndex === groupIndex
                        ? 'bg-primary/20'
                        : ''
                    }`}
                    draggable={onGroupsChange !== undefined}
                    onDragStart={() => onGroupsChange && handleDragGroupStart(groupIndex)}
                    onDragOver={(e) => onGroupsChange && handleDragGroupOver(e, groupIndex)}
                    onDragLeave={() => onGroupsChange && handleDragGroupLeave()}
                    onDrop={(e) => onGroupsChange && handleDropGroup(e, groupIndex)}
                    onDragEnd={() => onGroupsChange && handleDragGroupEnd()}
                  >
                    <td colSpan={7} className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        {onGroupsChange && (
                          <div 
                            className="cursor-grab active:cursor-grabbing text-primary hover:text-primary transition-colors"
                            title="Drag to reorder group"
                          >
                            <DotsSixVertical size={16} weight="bold" />
                          </div>
                        )}
                        
                        <button
                          onClick={() => toggleGroupCollapse(group.id)}
                          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          {isGroupCollapsed ? (
                            <CaretRight size={16} weight="bold" />
                          ) : (
                            <CaretDown size={16} weight="bold" />
                          )}
                          <Folder size={16} weight="fill" />
                        </button>
                        
                        <Input
                          value={group.name}
                          onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                          className="h-8 max-w-xs font-semibold text-primary border-0 bg-transparent hover:bg-background/50 focus:bg-background px-2"
                          placeholder="Group name"
                        />
                        
                        <div className="text-xs text-muted-foreground">
                          {groupItems.length} SKU{groupItems.length !== 1 ? 's' : ''}
                        </div>
                        
                        {group.decorations.length > 0 && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-md">
                            <span className="text-xs font-medium text-primary">
                              {group.decorations.length} Group Imprint{group.decorations.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        
                        <div className="ml-auto flex items-center gap-2">
                          {onGroupsChange && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleLocationsSection(`group-${group.id}`)}
                                className="h-7 text-xs"
                              >
                                <Plus size={14} className="mr-1" />
                                {expandedLocations.has(`group-${group.id}`) ? 'Hide' : 'Manage'} Imprints
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-muted-foreground"
                                  >
                                    <DotsThree size={14} weight="bold" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {group.decorations.length > 0 && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          groupItems.forEach(item => {
                                            applyGroupDecorationsToItem(item.id, group.id)
                                          })
                                          toast.success(`Applied to all ${groupItems.length} items in group`)
                                        }}
                                      >
                                        <CopySimple size={14} className="mr-2" />
                                        Apply to All Items
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => deleteGroup(group.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash size={14} className="mr-2" />
                                    Delete Group
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  {!isGroupCollapsed && expandedLocations.has(`group-${group.id}`) && (
                    <tr className="border-b border-border bg-primary/5">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-semibold text-primary">
                              Group Imprints
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Define imprints once, then apply to all {groupItems.length} items in this group
                            </div>
                          </div>
                          
                          <DecorationManager
                            decorations={group.decorations || []}
                            onChange={(decorations) => updateGroup(group.id, { decorations })}
                            productType="tshirt"
                            customerId={customerId}
                            customerName={customerName}
                            customerTemplates={customerTemplatesForCustomer}
                            customerArtworkFiles={customerArtworkFiles}
                            onSaveTemplate={onSaveTemplate}
                          />
                          
                          {group.decorations.length > 0 && (
                            <div className="mt-4 p-3 bg-muted/50 border border-border rounded-lg">
                              <div className="text-xs font-semibold text-muted-foreground mb-2">
                                APPLY TO ITEMS
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    groupItems.forEach(item => {
                                      applyGroupDecorationsToItem(item.id, group.id)
                                    })
                                    toast.success(`Applied to all ${groupItems.length} items in group`)
                                  }}
                                  className="h-8 text-xs"
                                >
                                  <CopySimple size={14} className="mr-1.5" />
                                  Apply to All {groupItems.length} Items
                                </Button>
                                
                                {groupItems.map((item, idx) => {
                                  const actualIndex = items.findIndex(i => i.id === item.id)
                                  const hasGroupImprints = item.decorations && 
                                    item.decorations.length === group.decorations.length &&
                                    item.decorations.every((dec, i) => 
                                      group.decorations[i] && 
                                      dec.location === group.decorations[i].location &&
                                      dec.method === group.decorations[i].method
                                    )
                                  
                                  return (
                                    <Button
                                      key={item.id}
                                      variant={hasGroupImprints ? "secondary" : "outline"}
                                      size="sm"
                                      onClick={() => applyGroupDecorationsToItem(item.id, group.id)}
                                      className="h-8 text-xs"
                                    >
                                      {hasGroupImprints && <span className="mr-1.5">✓</span>}
                                      Item #{actualIndex + 1}
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {!isGroupCollapsed && groupItems.map((item, itemIndexInAll) => {
                    const actualIndex = items.findIndex(i => i.id === item.id)
                    return renderLineItem(item, actualIndex, true, group.id)
                  })}
                </React.Fragment>
              )
            })}
            
            {ungroupedItems.map((item, itemIndexInUngrouped) => {
              const actualIndex = items.findIndex(i => i.id === item.id)
              return renderLineItem(item, actualIndex, false)
            })}
          </tbody>
        </table>
        
        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No line items yet. Click "Add Line Item" to get started.
          </div>
        )}
      </div>
    </>
  )
}
