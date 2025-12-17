import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plugs, 
  CheckCircle, 
  XCircle, 
  Clock,
  Copy,
  Plus,
  Trash,
  Lightning,
  Package,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { 
  WebhookConfig, 
  SupplierSource, 
  WebhookEventType 
} from '@/lib/webhook-types'

interface WebhookManagerProps {
  configs: WebhookConfig[]
  onSaveConfig: (config: WebhookConfig) => void
  onDeleteConfig: (configId: string) => void
  onToggleConfig: (configId: string, isActive: boolean) => void
  onTestWebhook: (configId: string) => void
}

export function WebhookManager({
  configs,
  onSaveConfig,
  onDeleteConfig,
  onToggleConfig,
  onTestWebhook,
}: WebhookManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingConfig, setEditingConfig] = useState<WebhookConfig | null>(null)

  const handleCreateConfig = () => {
    setEditingConfig(null)
    setShowCreateDialog(true)
  }

  const handleEditConfig = (config: WebhookConfig) => {
    setEditingConfig(config)
    setShowCreateDialog(true)
  }

  const handleCopyEndpoint = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Webhook URL copied to clipboard')
  }

  const getStatusBadge = (config: WebhookConfig) => {
    if (!config.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    return <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>
  }

  const getSupplierIcon = (source: SupplierSource) => {
    return <Package size={20} weight="duotone" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Webhook Configurations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Receive real-time inventory updates from your suppliers
          </p>
        </div>
        <Button onClick={handleCreateConfig}>
          <Plus size={16} className="mr-2" />
          Add Webhook
        </Button>
      </div>

      <div className="grid gap-4">
        {configs.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Plugs size={32} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No webhooks configured</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first webhook to start receiving real-time inventory updates
                </p>
              </div>
              <Button onClick={handleCreateConfig} className="mt-2">
                <Plus size={16} className="mr-2" />
                Add Webhook
              </Button>
            </div>
          </Card>
        ) : (
          configs.map((config) => (
            <Card key={config.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {getSupplierIcon(config.source)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{config.name}</h3>
                      {getStatusBadge(config)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="capitalize">
                        <span className="font-medium">Source:</span> {config.source}
                      </p>
                      {config.endpointUrl && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Endpoint:</span>
                          <code className="px-2 py-1 bg-muted rounded text-xs font-mono truncate max-w-md">
                            {config.endpointUrl}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyEndpoint(config.endpointUrl!)}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      )}
                      <p>
                        <span className="font-medium">Events:</span>{' '}
                        {config.events.length} configured
                      </p>
                      {config.lastTriggeredAt && (
                        <p className="text-xs">
                          Last triggered: {new Date(config.lastTriggeredAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch
                    checked={config.isActive}
                    onCheckedChange={(checked) => onToggleConfig(config.id, checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTestWebhook(config.id)}
                  >
                    <Lightning size={14} className="mr-1" />
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditConfig(config)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this webhook?')) {
                        onDeleteConfig(config.id)
                      }
                    }}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <WebhookConfigDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        config={editingConfig}
        onSave={(config) => {
          onSaveConfig(config)
          setShowCreateDialog(false)
          setEditingConfig(null)
        }}
      />
    </div>
  )
}

interface WebhookConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: WebhookConfig | null
  onSave: (config: WebhookConfig) => void
}

function WebhookConfigDialog({ open, onOpenChange, config, onSave }: WebhookConfigDialogProps) {
  const [name, setName] = useState(config?.name || '')
  const [source, setSource] = useState<SupplierSource>(config?.source || 'ssactivewear')
  const [isActive, setIsActive] = useState(config?.isActive ?? true)
  const [endpointUrl, setEndpointUrl] = useState(config?.endpointUrl || '')
  const [secret, setSecret] = useState(config?.secret || '')
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>(
    config?.events || ['inventory.updated']
  )

  const eventOptions: { value: WebhookEventType; label: string; description: string }[] = [
    { 
      value: 'inventory.updated', 
      label: 'Inventory Updated', 
      description: 'Triggered when inventory levels change' 
    },
    { 
      value: 'inventory.low_stock', 
      label: 'Low Stock Alert', 
      description: 'Triggered when inventory falls below threshold' 
    },
    { 
      value: 'inventory.out_of_stock', 
      label: 'Out of Stock', 
      description: 'Triggered when inventory reaches zero' 
    },
    { 
      value: 'inventory.restocked', 
      label: 'Restocked', 
      description: 'Triggered when out-of-stock items are replenished' 
    },
    { 
      value: 'product.updated', 
      label: 'Product Updated', 
      description: 'Triggered when product details change' 
    },
    { 
      value: 'product.discontinued', 
      label: 'Product Discontinued', 
      description: 'Triggered when products are discontinued' 
    },
    { 
      value: 'pricing.updated', 
      label: 'Pricing Updated', 
      description: 'Triggered when product prices change' 
    },
  ]

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a webhook name')
      return
    }

    const newConfig: WebhookConfig = {
      id: config?.id || `webhook_${Date.now()}`,
      name: name.trim(),
      source,
      isActive,
      endpointUrl: endpointUrl.trim() || undefined,
      secret: secret.trim() || undefined,
      events: selectedEvents,
      createdAt: config?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastTriggeredAt: config?.lastTriggeredAt,
    }

    onSave(newConfig)
    toast.success(config ? 'Webhook updated' : 'Webhook created')
  }

  const toggleEvent = (eventType: WebhookEventType) => {
    setSelectedEvents((current) =>
      current.includes(eventType)
        ? current.filter((e) => e !== eventType)
        : [...current, eventType]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{config ? 'Edit Webhook' : 'Create Webhook'}</DialogTitle>
          <DialogDescription>
            Configure webhook settings to receive real-time inventory updates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-name">Webhook Name</Label>
            <Input
              id="webhook-name"
              placeholder="e.g., SS Activewear Inventory Sync"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-source">Supplier Source</Label>
            <Select value={source} onValueChange={(val) => setSource(val as SupplierSource)}>
              <SelectTrigger id="webhook-source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ssactivewear">SS Activewear</SelectItem>
                <SelectItem value="sanmar">SanMar</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-endpoint">Endpoint URL (Optional)</Label>
            <Input
              id="webhook-endpoint"
              type="url"
              placeholder="https://your-domain.com/webhooks/inventory"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the default webhook endpoint
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
            <Input
              id="webhook-secret"
              type="password"
              placeholder="Enter a secret key for verification"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Used to verify webhook authenticity
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Event Types</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Select which events should trigger this webhook
            </p>
            <div className="space-y-2">
              {eventOptions.map((event) => (
                <div
                  key={event.value}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`event-${event.value}`}
                    checked={selectedEvents.includes(event.value)}
                    onChange={() => toggleEvent(event.value)}
                    className="mt-1"
                  />
                  <label htmlFor={`event-${event.value}`} className="flex-1 cursor-pointer">
                    <div className="font-medium text-sm">{event.label}</div>
                    <div className="text-xs text-muted-foreground">{event.description}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="webhook-active">Activate Webhook</Label>
            <Switch
              id="webhook-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {config ? 'Update' : 'Create'} Webhook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
