import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardSkeleton } from '@/components/skeletons'
import {
  FileText,
  Briefcase,
  Users,
  CheckCircle,
  CurrencyDollar,
  ArrowRight,
  Calendar,
  Sparkle,
  Plus,
  Palette,
  TShirt,
  ThreadsLogo,
  Package,
  Warning,
  ArrowClockwise
} from '@phosphor-icons/react'
import type { Quote, Job, Customer, QuoteStatus, JobStatus } from '@/lib/types'
import { useProductionStats } from '@/lib/api-hooks'
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
  const { data: productionStats, isLoading, error, refetch } = useProductionStats()

  // Calculate in-production total (screenprint + embroidery + dtg)
  const inProduction = useMemo(() => {
    if (!productionStats) return 0
    return productionStats.screenprint + productionStats.embroidery + productionStats.dtg
  }, [productionStats])

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

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Warning size={48} className="mx-auto mb-4 text-destructive" />
            <h2 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h2>
            <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <ArrowClockwise size={16} />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Sparkle size={32} weight="fill" className="text-primary" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Production Overview
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

        {/* Production Stats Grid */}
        {productionStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Quotes */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-amber-500/10 border-amber-500/20" onClick={onNavigateToQuotes}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <FileText size={18} weight="fill" />
                  <span className="text-xs font-medium uppercase tracking-wide">Quotes</span>
                </div>
                <p className="text-2xl font-bold">{productionStats.quote.toLocaleString()}</p>
              </CardContent>
            </Card>

            {/* Art */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-purple-500/10 border-purple-500/20" onClick={onNavigateToJobs}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Palette size={18} weight="fill" />
                  <span className="text-xs font-medium uppercase tracking-wide">Art</span>
                </div>
                <p className="text-2xl font-bold">{productionStats.art.toLocaleString()}</p>
              </CardContent>
            </Card>

            {/* Screenprint */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-blue-500/10 border-blue-500/20" onClick={onNavigateToJobs}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <TShirt size={18} weight="fill" />
                  <span className="text-xs font-medium uppercase tracking-wide">Screen</span>
                </div>
                <p className="text-2xl font-bold">{productionStats.screenprint.toLocaleString()}</p>
              </CardContent>
            </Card>

            {/* Embroidery */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-pink-500/10 border-pink-500/20" onClick={onNavigateToJobs}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-pink-600 mb-2">
                  <ThreadsLogo size={18} weight="fill" />
                  <span className="text-xs font-medium uppercase tracking-wide">Emb</span>
                </div>
                <p className="text-2xl font-bold">{productionStats.embroidery.toLocaleString()}</p>
              </CardContent>
            </Card>

            {/* DTG */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-cyan-500/10 border-cyan-500/20" onClick={onNavigateToJobs}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-cyan-600 mb-2">
                  <TShirt size={18} weight="fill" />
                  <span className="text-xs font-medium uppercase tracking-wide">DTG</span>
                </div>
                <p className="text-2xl font-bold">{productionStats.dtg.toLocaleString()}</p>
              </CardContent>
            </Card>

            {/* Fulfillment */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-orange-500/10 border-orange-500/20" onClick={onNavigateToJobs}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <Package size={18} weight="fill" />
                  <span className="text-xs font-medium uppercase tracking-wide">Fulfill</span>
                </div>
                <p className="text-2xl font-bold">{productionStats.fulfillment.toLocaleString()}</p>
              </CardContent>
            </Card>

            {/* Complete */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-green-500/10 border-green-500/20" onClick={onNavigateToJobs}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle size={18} weight="fill" />
                  <span className="text-xs font-medium uppercase tracking-wide">Done</span>
                </div>
                <p className="text-2xl font-bold">{productionStats.complete.toLocaleString()}</p>
              </CardContent>
            </Card>

            {/* Total */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-primary/10 border-primary/20" onClick={onNavigateToJobs}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Briefcase size={18} weight="fill" />
                  <span className="text-xs font-medium uppercase tracking-wide">Total</span>
                </div>
                <p className="text-2xl font-bold">{productionStats.total.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToJobs}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Production</CardTitle>
              <Briefcase size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inProduction}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Screen + Embroidery + DTG
              </p>
              {productionStats && (
                <div className="mt-3 flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {productionStats.screenprint} screen
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {productionStats.embroidery} emb
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {productionStats.dtg} dtg
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToQuotes}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
              <FileText size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{productionStats?.quote.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting customer approval
              </p>
              {productionStats && productionStats.art > 0 && (
                <div className="mt-3">
                  <Badge variant="outline" className="text-xs">
                    {productionStats.art} in art approval
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToCustomers}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready for Delivery</CardTitle>
              <Package size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{productionStats?.fulfillment || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Jobs in fulfillment stage
              </p>
              {productionStats && (
                <div className="mt-3">
                  <Badge variant="default" className="text-xs bg-green-600">
                    {productionStats.complete.toLocaleString()} completed all-time
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Jobs Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Jobs</CardTitle>
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
                  <p className="text-muted-foreground mb-4">No active jobs in local data</p>
                  <Button onClick={onNewJob} variant="outline" size="sm" className="gap-2">
                    <Plus size={16} />
                    Create First Job
                  </Button>
                </div>
              ) : (
                activeJobs.slice(0, 10).map(job => {
                  const quote = quotes.find(q => q.id === job.quote_id)
                  const today = new Date()
                  const dueDate = job.due_date ? new Date(job.due_date) : null
                  const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
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
                            <span className="text-xs text-muted-foreground truncate">- {job.nickname}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{job.customer.name}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-muted-foreground" />
                              <p className={`text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
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
              {activeJobs.length > 10 && (
                <Button variant="ghost" className="w-full" onClick={onNavigateToJobs}>
                  View all {activeJobs.length} active jobs
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quotes Needing Follow-Up */}
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
                {quotesNeedingFollowUp.slice(0, 5).map(quote => (
                  <div
                    key={quote.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => onSelectQuote(quote)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{quote.quote_number}</p>
                        {quote.nickname && (
                          <span className="text-xs text-muted-foreground truncate">- {quote.nickname}</span>
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
                {quotesNeedingFollowUp.length > 5 && (
                  <Button variant="ghost" className="w-full" onClick={onNavigateToQuotes}>
                    View all {quotesNeedingFollowUp.length} quotes
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
