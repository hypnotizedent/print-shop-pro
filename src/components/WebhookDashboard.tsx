import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WebhookManager } from './WebhookManager'
import { WebhookEventViewer } from './WebhookEventViewer'
import { InventoryAlerts } from './InventoryAlerts'
import { toast } from 'sonner'
import { 
  WebhookConfig, 
  WebhookEvent, 
  InventoryAlert,
  WebhookNotification 
} from '@/lib/webhook-types'
import { 
  webhookProcessor, 
  generateMockWebhookEvent,
  parseSSActivewearWebhook,
  parseSanMarWebhook 
} from '@/lib/webhook-processor'
import { 
  Plugs, 
  Bell, 
  ClockCounterClockwise,
  ArrowsClockwise,
  CheckCircle,
} from '@phosphor-icons/react'

interface WebhookDashboardProps {
  configs: WebhookConfig[]
  events: WebhookEvent[]
  alerts: InventoryAlert[]
  notifications: WebhookNotification[]
  onSaveConfig: (config: WebhookConfig) => void
  onDeleteConfig: (configId: string) => void
  onToggleConfig: (configId: string, isActive: boolean) => void
  onUpdateEvent: (event: WebhookEvent) => void
  onAcknowledgeAlert: (alertId: string) => void
  onDismissAllAlerts: () => void
  onAddEvent: (event: WebhookEvent) => void
  onAddAlert: (alert: InventoryAlert) => void
  onAddNotification: (notification: WebhookNotification) => void
}

export function WebhookDashboard({
  configs,
  events,
  alerts,
  notifications,
  onSaveConfig,
  onDeleteConfig,
  onToggleConfig,
  onUpdateEvent,
  onAcknowledgeAlert,
  onDismissAllAlerts,
  onAddEvent,
  onAddAlert,
  onAddNotification,
}: WebhookDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isProcessing, setIsProcessing] = useState(false)

  const activeConfigs = configs.filter(c => c.isActive).length
  const pendingEvents = events.filter(e => e.status === 'pending' || e.status === 'processing').length
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledgedAt).length
  const unreadNotifications = notifications.filter(n => !n.read).length

  const handleTestWebhook = async (configId: string) => {
    const config = configs.find(c => c.id === configId)
    if (!config) return

    toast.info('Generating test webhook event...')

    const mockEvent = generateMockWebhookEvent(config.source)
    onAddEvent(mockEvent)

    setTimeout(async () => {
      setIsProcessing(true)
      const updatedEvent = { ...mockEvent, status: 'processing' as const }
      onUpdateEvent(updatedEvent)

      const result = await webhookProcessor.processWebhookEvent(
        updatedEvent,
        onAddNotification,
        onAddAlert
      )

      setIsProcessing(false)

      if (result.success) {
        onUpdateEvent({
          ...updatedEvent,
          status: 'completed',
          processedAt: new Date().toISOString(),
        })
        
        toast.success('Test webhook processed successfully', {
          description: `Generated ${result.notifications.length} notifications and ${result.alerts.length} alerts`,
        })
      } else {
        onUpdateEvent({
          ...updatedEvent,
          status: 'failed',
          error: 'Processing failed',
        })
        toast.error('Test webhook processing failed')
      }
    }, 1000)
  }

  const handleRetryEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (!event) return

    toast.info('Retrying event...')
    
    const updatedEvent = {
      ...event,
      status: 'retrying' as const,
      retryCount: event.retryCount + 1,
    }
    onUpdateEvent(updatedEvent)

    setTimeout(async () => {
      setIsProcessing(true)
      const processingEvent = { ...updatedEvent, status: 'processing' as const }
      onUpdateEvent(processingEvent)

      const result = await webhookProcessor.processWebhookEvent(
        processingEvent,
        onAddNotification,
        onAddAlert
      )

      setIsProcessing(false)

      if (result.success) {
        onUpdateEvent({
          ...processingEvent,
          status: 'completed',
          processedAt: new Date().toISOString(),
          error: undefined,
        })
        toast.success('Event processed successfully')
      } else {
        onUpdateEvent({
          ...processingEvent,
          status: 'failed',
          error: 'Retry failed',
        })
        toast.error('Event processing failed')
      }
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Webhook Integration</h1>
        <p className="text-muted-foreground mt-2">
          Manage real-time supplier inventory updates and alerts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plugs size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeConfigs}</p>
              <p className="text-xs text-muted-foreground">Active Webhooks</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ClockCounterClockwise size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Bell size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unacknowledgedAlerts}</p>
              <p className="text-xs text-muted-foreground">Pending Alerts</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {events.filter(e => e.status === 'completed').length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Plugs size={16} className="mr-2" />
            Webhooks
            {configs.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {configs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="events">
            <ClockCounterClockwise size={16} className="mr-2" />
            Events
            {pendingEvents > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingEvents}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell size={16} className="mr-2" />
            Alerts
            {unacknowledgedAlerts > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unacknowledgedAlerts}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <WebhookManager
            configs={configs}
            onSaveConfig={onSaveConfig}
            onDeleteConfig={onDeleteConfig}
            onToggleConfig={onToggleConfig}
            onTestWebhook={handleTestWebhook}
          />
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <WebhookEventViewer
            events={events}
            onRetryEvent={handleRetryEvent}
          />
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <InventoryAlerts
            alerts={alerts}
            onAcknowledge={onAcknowledgeAlert}
            onDismissAll={onDismissAllAlerts}
          />
        </TabsContent>
      </Tabs>

      {isProcessing && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <ArrowsClockwise size={20} className="animate-spin text-primary" />
              <span className="text-sm font-medium">Processing webhook event...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
