import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardSkeleton } from '@/components/skeletons'
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
  Sparkle,
  Plus
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
  onNewQuote: () => void
  onNewJob: () => void
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
  onUpdateJobStatus,
  onNewQuote,
  onNewJob
}: HomeProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const stats = useMemo(() => {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    const quotesNeedingFollowUp = quotes.filter(q => {
      const createdDate = new Date(q.created_at)
      return createdDate >= oneMonthAgo && q.status !== 'approved' && q.status !== 'rejected'
    })
    
    const activeJobs = jobs.filter(j => j.status !== 'delivered')
    const completedJobs = jobs.filter(j => j.status === 'delivered')
    
    const totalJobValue = jobs
      .filter(j => j.status !== 'delivered')
      .reduce((sum, j) => {
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
    
    const followUpValue = quotesNeedingFollowUp.reduce((sum, q) => sum + q.total, 0)
    
    return {
      quotesNeedingFollowUp: quotesNeedingFollowUp.length,
      followUpValue,
      activeJobs: activeJobs.length,
      completedJobs: completedJobs.length,
      totalCustomers: customers.length,
      totalJobValue,
      pendingArtApproval: pendingArtApproval.length,
      inProduction: inProduction.length,
      readyForPickup: readyForPickup.length,
    }
  }, [quotes, jobs, customers])

  const quotesNeedingFollowUp = useMemo(() => {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    return quotes
      .filter(q => {
        const createdDate = new Date(q.created_at)
        return createdDate >= oneMonthAgo && q.status !== 'approved' && q.status !== 'rejected'
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [quotes])

  const activeJobs = useMemo(() => {
    return jobs
      .filter(j => j.status !== 'delivered')
      .sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      })
  }, [jobs])

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

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Sparkle size={32} weight="fill" className="text-primary" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Your print shop at a glance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={onNewQuote} size="default" className="gap-2">
              <Plus size={18} weight="bold" />
              New Quote
            </Button>
            <Button onClick={onNewJob} variant="secondary" size="default" className="gap-2">
              <Plus size={18} weight="bold" />
              New Job
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToJobs}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Not marked as complete
              </p>
              <div className="mt-2 text-sm font-medium text-primary">
                {formatCurrency(stats.totalJobValue)} in production
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToQuotes}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Follow-Up Needed</CardTitle>
              <FileText size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quotesNeedingFollowUp}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Created this month • Not approved
              </p>
              <div className="mt-2 text-sm font-medium text-primary">
                {formatCurrency(stats.followUpValue)} potential value
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToCustomers}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedJobs} jobs completed
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Active Jobs</CardTitle>
                <CardDescription>Jobs not marked as delivered, sorted by due date</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onNavigateToJobs}>
                View Jobs Board
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase size={48} className="mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">No active jobs</p>
                  <Button onClick={onNewJob} variant="outline" size="sm" className="gap-2">
                    <Plus size={16} />
                    Create First Job
                  </Button>
                </div>
              ) : (
                activeJobs.map(job => {
                  const quote = quotes.find(q => q.id === job.quote_id)
                  const today = new Date()
                  const dueDate = job.due_date ? new Date(job.due_date) : null
                  const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
                  const isUrgent = daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0
                  const isOverdue = daysUntilDue !== null && daysUntilDue < 0
                  
                  return (
                    <div 
                      key={job.id}
                      className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
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
                        <div className="flex items-center gap-3 mt-2">
                          {dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {isOverdue ? 'Overdue' : 'Due'} {format(dueDate, 'MMM d')} 
                                {daysUntilDue !== null && ` (${Math.abs(daysUntilDue)}d)`}
                              </p>
                            </div>
                          )}
                          {quote && (
                            <div className="flex items-center gap-1">
                              <CurrencyDollar size={12} className="text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(quote.total)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={getStatusBadgeVariant(job.status)}>
                          {job.status}
                        </Badge>
                        {job.line_items && job.line_items.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {job.line_items.reduce((sum, item) => sum + item.quantity, 0)} items
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {quotesNeedingFollowUp.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quotes Needing Follow-Up</CardTitle>
                  <CardDescription>Created this month but not yet approved</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={onNavigateToQuotes}>
                  View All Quotes
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quotesNeedingFollowUp.map(quote => (
                  <div 
                    key={quote.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
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
                        Created {format(new Date(quote.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={getStatusBadgeVariant(quote.status)}>
                        {quote.status}
                      </Badge>
                      <span className="text-sm font-medium">{formatCurrency(quote.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
