import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendUp, 
  TrendDown,
  FileText, 
  Briefcase, 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  CurrencyDollar,
  ArrowRight,
  Calendar,
  Package,
  Printer,
  Sparkle
} from '@phosphor-icons/react'
import type { Quote, Job, Customer, QuoteStatus, JobStatus } from '@/lib/types'
import { format } from 'date-fns'

interface HomeProps {
  quotes: Quote[]
  jobs: Job[]
  customers: Customer[]
  onNavigateToQuotes: () => void
  onNavigateToJobs: () => void
  onNavigateToCustomers: () => void
  onSelectQuote: (quote: Quote) => void
  onSelectJob: (job: Job) => void
  onUpdateQuoteStatus: (quoteId: string, status: QuoteStatus) => void
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void
}

export function Home({ 
  quotes, 
  jobs, 
  customers,
  onNavigateToQuotes,
  onNavigateToJobs,
  onNavigateToCustomers,
  onSelectQuote,
  onSelectJob,
  onUpdateQuoteStatus,
  onUpdateJobStatus
}: HomeProps) {
  const stats = useMemo(() => {
    const activeQuotes = quotes.filter(q => q.status === 'sent' || q.status === 'draft')
    const approvedQuotes = quotes.filter(q => q.status === 'approved')
    const expiredQuotes = quotes.filter(q => q.status === 'expired')
    
    const activeJobs = jobs.filter(j => j.status !== 'delivered')
    const completedJobs = jobs.filter(j => j.status === 'delivered')
    
    const totalQuoteValue = quotes.reduce((sum, q) => {
      if (q.status !== 'rejected' && q.status !== 'expired') {
        return sum + q.total
      }
      return sum
    }, 0)
    
    const totalJobValue = jobs.reduce((sum, j) => {
      const quote = quotes.find(q => q.id === j.quote_id)
      return sum + (quote?.total || 0)
    }, 0)
    
    const pendingArtApproval = jobs.filter(j => 
      j.status === 'pending' || j.status === 'art-approval'
    )
    
    const inProduction = jobs.filter(j => 
      j.status === 'scheduled' || j.status === 'printing' || j.status === 'finishing'
    )
    
    const readyForPickup = jobs.filter(j => j.status === 'ready')
    
    return {
      activeQuotes: activeQuotes.length,
      approvedQuotes: approvedQuotes.length,
      expiredQuotes: expiredQuotes.length,
      activeJobs: activeJobs.length,
      completedJobs: completedJobs.length,
      totalCustomers: customers.length,
      totalQuoteValue,
      totalJobValue,
      pendingArtApproval: pendingArtApproval.length,
      inProduction: inProduction.length,
      readyForPickup: readyForPickup.length,
    }
  }, [quotes, jobs, customers])

  const recentQuotes = useMemo(() => {
    return [...quotes]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [quotes])

  const urgentJobs = useMemo(() => {
    const today = new Date()
    return jobs
      .filter(j => {
        if (j.status === 'delivered') return false
        if (!j.due_date) return false
        const dueDate = new Date(j.due_date)
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilDue <= 7 && daysUntilDue >= 0
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5)
  }, [jobs])

  const recentCustomers = useMemo(() => {
    const customersWithActivity = customers.map(customer => {
      const customerQuotes = quotes.filter(q => q.customer.id === customer.id)
      const latestQuote = customerQuotes.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
      
      return {
        ...customer,
        lastActivity: latestQuote?.created_at || '',
        quoteCount: customerQuotes.length
      }
    })
    
    return customersWithActivity
      .filter(c => c.lastActivity)
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, 5)
  }, [customers, quotes])

  const getStatusBadgeVariant = (status: QuoteStatus | JobStatus) => {
    switch (status) {
      case 'approved':
      case 'delivered':
        return 'default'
      case 'sent':
      case 'scheduled':
      case 'printing':
        return 'secondary'
      case 'draft':
      case 'pending':
        return 'outline'
      case 'rejected':
      case 'expired':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Sparkle size={32} weight="fill" className="text-primary" />
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Your print shop at a glance
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToQuotes}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
              <FileText size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeQuotes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.approvedQuotes} approved • {stats.expiredQuotes} expired
              </p>
              <div className="mt-2 text-sm font-medium text-primary">
                {formatCurrency(stats.totalQuoteValue)} total value
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToJobs}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedJobs} completed this month
              </p>
              <div className="mt-2 text-sm font-medium text-primary">
                {formatCurrency(stats.totalJobValue)} in production
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToCustomers}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {recentCustomers.length} active this week
              </p>
              <div className="mt-2 text-sm font-medium text-accent">
                {(stats.totalQuoteValue / stats.totalCustomers || 0).toFixed(0)} avg. quote value
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Production Status</CardTitle>
              <Printer size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProduction}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingArtApproval} pending approval
              </p>
              <div className="mt-2 text-sm font-medium text-accent">
                {stats.readyForPickup} ready for pickup
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Quotes</CardTitle>
                  <CardDescription>Latest quote activity</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={onNavigateToQuotes}>
                  View All
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentQuotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No quotes yet
                  </div>
                ) : (
                  recentQuotes.map(quote => (
                    <div 
                      key={quote.id}
                      className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => onSelectQuote(quote)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{quote.quote_number}</p>
                          {quote.nickname && (
                            <span className="text-xs text-muted-foreground truncate">• {quote.nickname}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{quote.customer.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(quote.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={getStatusBadgeVariant(quote.status)}>
                          {quote.status}
                        </Badge>
                        <span className="text-sm font-medium">{formatCurrency(quote.total)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Urgent Jobs</CardTitle>
                  <CardDescription>Due within 7 days</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={onNavigateToJobs}>
                  View All
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {urgentJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle size={32} className="mx-auto mb-2 text-primary" />
                    No urgent jobs
                  </div>
                ) : (
                  urgentJobs.map(job => {
                    const dueDate = new Date(job.due_date)
                    const today = new Date()
                    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    
                    return (
                      <div 
                        key={job.id}
                        className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() => onSelectJob(job)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{job.job_number}</p>
                            {job.nickname && (
                              <span className="text-xs text-muted-foreground truncate">• {job.nickname}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{job.customer.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock size={12} className={daysUntilDue <= 2 ? 'text-destructive' : 'text-muted-foreground'} />
                            <p className={`text-xs ${daysUntilDue <= 2 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                              Due {format(dueDate, 'MMM d')} ({daysUntilDue}d)
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={getStatusBadgeVariant(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Customers</CardTitle>
                <CardDescription>Latest customer activity</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onNavigateToCustomers}>
                View All
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No customer activity yet
                </div>
              ) : (
                recentCustomers.map(customer => (
                  <div 
                    key={customer.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{customer.name}</p>
                      {customer.company && (
                        <p className="text-sm text-muted-foreground">{customer.company}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Last activity: {format(new Date(customer.lastActivity), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm text-muted-foreground">{customer.quoteCount} quotes</span>
                      {customer.tier && (
                        <Badge variant="outline" className="text-xs">
                          {customer.tier}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
