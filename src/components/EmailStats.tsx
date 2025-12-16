import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Envelope,
  EnvelopeOpen,
  CheckCircle,
  XCircle,
  TrendUp,
} from '@phosphor-icons/react'
import type { EmailNotification } from '@/lib/types'
import { getEmailStats } from '@/lib/email-notifications'

interface EmailStatsProps {
  notifications: EmailNotification[]
}

export function EmailStats({ notifications }: EmailStatsProps) {
  const stats = getEmailStats(notifications)
  
  const last30Days = notifications.filter(n => {
    const sentDate = new Date(n.sentAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return sentDate >= thirtyDaysAgo
  })
  
  const last30DaysStats = getEmailStats(last30Days)
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.total}</div>
              <Envelope size={24} className="text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {last30DaysStats.total} in last 30 days
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.delivered}</div>
              <CheckCircle size={24} className="text-primary" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0}% delivery rate
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Opened</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.opened}</div>
              <EnvelopeOpen size={24} className="text-primary" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.openRate}% open rate
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.failed}</div>
              <XCircle size={24} className="text-destructive" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.sent > 0 ? Math.round((stats.failed / stats.sent) * 100) : 0}% failure rate
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.byType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                
                const labels: Record<string, string> = {
                  'quote-approval-request': 'Quote Approval Requests',
                  'quote-approved': 'Quote Approved',
                  'quote-reminder': 'Quote Reminders',
                  'order-status-update': 'Order Status Updates',
                  'artwork-approval-request': 'Artwork Approval Requests',
                  'artwork-status-update': 'Artwork Status Updates',
                  'payment-reminder': 'Payment Reminders',
                  'payment-confirmation': 'Payment Confirmations',
                  'shipping-notification': 'Shipping Notifications',
                  'pickup-notification': 'Pickup Notifications',
                  'invoice-reminder': 'Invoice Reminders',
                  'invoice-sent': 'Invoices Sent',
                  'marketing-message': 'Marketing Messages',
                  'production-update': 'Production Updates',
                  'custom': 'Custom Emails',
                }
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm text-muted-foreground min-w-[180px]">
                        {labels[type] || type}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-sm font-medium min-w-[40px] text-right">{count}</span>
                      <Badge variant="secondary" className="min-w-[50px] justify-center">
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
      
      {stats.clicked > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp size={20} />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Click Rate</div>
                <div className="text-2xl font-bold">{stats.clickRate}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.clicked} clicks from {stats.opened} opened emails
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Click-to-Open Rate</div>
                <div className="text-2xl font-bold">
                  {stats.opened > 0 ? Math.round((stats.clicked / stats.opened) * 100) : 0}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Unique clicks per opened email
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
