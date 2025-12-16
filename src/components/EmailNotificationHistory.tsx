import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Envelope,
  EnvelopeOpen,
  CheckCircle,
  XCircle,
  Clock,
  MagnifyingGlass,
  CaretDown,
  CaretUp,
} from '@phosphor-icons/react'
import type { EmailNotification, EmailNotificationType } from '@/lib/types'

interface EmailNotificationHistoryProps {
  customerId?: string
  notifications: EmailNotification[]
  title?: string
  showCustomerColumn?: boolean
}

const EMAIL_TYPE_LABELS: Record<EmailNotificationType, string> = {
  'quote-approval-request': 'Quote Approval Request',
  'quote-approved': 'Quote Approved',
  'quote-reminder': 'Quote Reminder',
  'order-status-update': 'Order Status Update',
  'artwork-approval-request': 'Artwork Approval Request',
  'artwork-status-update': 'Artwork Status Update',
  'payment-reminder': 'Payment Reminder',
  'payment-confirmation': 'Payment Confirmation',
  'shipping-notification': 'Shipping Notification',
  'pickup-notification': 'Pickup Notification',
  'invoice-reminder': 'Invoice Reminder',
  'invoice-sent': 'Invoice Sent',
  'marketing-message': 'Marketing Message',
  'production-update': 'Production Update',
  'custom': 'Custom Email',
}

export function EmailNotificationHistory({ 
  customerId, 
  notifications, 
  title = 'Email Notification History',
  showCustomerColumn = false,
}: EmailNotificationHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<EmailNotificationType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'delivered' | 'opened' | 'failed'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredNotifications = notifications.filter((notification) => {
    if (customerId && notification.customerId !== customerId) return false
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !notification.subject.toLowerCase().includes(query) &&
        !notification.customerEmail.toLowerCase().includes(query) &&
        !notification.metadata?.quoteNumber?.toLowerCase().includes(query) &&
        !notification.metadata?.jobNumber?.toLowerCase().includes(query)
      ) {
        return false
      }
    }
    
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false
    if (statusFilter !== 'all' && notification.status !== statusFilter) return false
    
    return true
  })

  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  )

  const getStatusBadge = (status: EmailNotification['status']) => {
    const variants = {
      sent: { variant: 'secondary' as const, icon: <Envelope size={14} />, label: 'Sent' },
      delivered: { variant: 'default' as const, icon: <CheckCircle size={14} />, label: 'Delivered' },
      opened: { variant: 'default' as const, icon: <EnvelopeOpen size={14} />, label: 'Opened' },
      clicked: { variant: 'default' as const, icon: <CheckCircle size={14} weight="fill" />, label: 'Clicked' },
      bounced: { variant: 'destructive' as const, icon: <XCircle size={14} />, label: 'Bounced' },
      failed: { variant: 'destructive' as const, icon: <XCircle size={14} />, label: 'Failed' },
    }
    
    const config = variants[status]
    return (
      <Badge variant={config.variant} className="gap-1 text-xs">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return `${minutes}m ago`
      }
      return `${hours}h ago`
    }
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="secondary">{sortedNotifications.length} emails</Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="flex-1 relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by subject, email, quote, or job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="quote-approval-request">Quote Approval</SelectItem>
              <SelectItem value="quote-approved">Quote Approved</SelectItem>
              <SelectItem value="payment-reminder">Payment Reminder</SelectItem>
              <SelectItem value="invoice-sent">Invoice Sent</SelectItem>
              <SelectItem value="order-status-update">Order Status</SelectItem>
              <SelectItem value="shipping-notification">Shipping</SelectItem>
              <SelectItem value="artwork-approval-request">Artwork Approval</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {sortedNotifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Envelope size={48} className="mx-auto mb-3 opacity-40" />
            <p>No email notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedNotifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {notification.status === 'opened' || notification.status === 'clicked' ? (
                      <EnvelopeOpen size={20} className="text-primary" />
                    ) : notification.status === 'failed' || notification.status === 'bounced' ? (
                      <XCircle size={20} className="text-destructive" />
                    ) : (
                      <Envelope size={20} className="text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 truncate">{notification.subject}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="truncate">{notification.customerEmail}</span>
                          {notification.metadata?.quoteNumber && (
                            <>
                              <span>•</span>
                              <span className="text-primary">{notification.metadata.quoteNumber}</span>
                            </>
                          )}
                          {notification.metadata?.jobNumber && (
                            <>
                              <span>•</span>
                              <span className="text-primary">{notification.metadata.jobNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(notification.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expandedId === notification.id ? null : notification.id)}
                          className="h-7 w-7 p-0"
                        >
                          {expandedId === notification.id ? (
                            <CaretUp size={16} />
                          ) : (
                            <CaretDown size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{formatDate(notification.sentAt)}</span>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {EMAIL_TYPE_LABELS[notification.type]}
                      </Badge>
                      
                      {notification.openedAt && (
                        <span className="text-primary">Opened {formatDate(notification.openedAt)}</span>
                      )}
                    </div>
                    
                    {expandedId === notification.id && (
                      <div className="mt-3 pt-3 border-t border-border space-y-2">
                        {notification.body && (
                          <div className="text-sm bg-muted/50 p-3 rounded-md">
                            <div className="font-medium mb-1 text-xs text-muted-foreground">Email Body:</div>
                            <div className="whitespace-pre-wrap">{notification.body}</div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {notification.deliveredAt && (
                            <div>
                              <span className="text-muted-foreground">Delivered:</span>
                              <span className="ml-2">{new Date(notification.deliveredAt).toLocaleString()}</span>
                            </div>
                          )}
                          {notification.clickedAt && (
                            <div>
                              <span className="text-muted-foreground">Clicked:</span>
                              <span className="ml-2">{new Date(notification.clickedAt).toLocaleString()}</span>
                            </div>
                          )}
                          {notification.sentBy && (
                            <div>
                              <span className="text-muted-foreground">Sent by:</span>
                              <span className="ml-2">{notification.sentBy}</span>
                            </div>
                          )}
                          {notification.errorMessage && (
                            <div className="col-span-2 text-destructive">
                              <span className="text-muted-foreground">Error:</span>
                              <span className="ml-2">{notification.errorMessage}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
