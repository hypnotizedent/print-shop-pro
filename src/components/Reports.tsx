import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartBar, TrendUp, Users, CurrencyDollar, Package, Warning } from '@phosphor-icons/react'
import type { Quote, Job, Customer, PaymentReminder } from '@/lib/types'
import { UnpaidBalancesReport } from '@/components/UnpaidBalancesReport'

interface ReportsProps {
  quotes: Quote[]
  jobs: Job[]
  customers: Customer[]
  paymentReminders?: PaymentReminder[]
  onSelectQuote?: (quote: Quote) => void
}

export function Reports({ quotes, jobs, customers, paymentReminders = [], onSelectQuote }: ReportsProps) {
  const stats = useMemo(() => {
    const totalRevenue = quotes
      .filter(q => q.status === 'approved')
      .reduce((sum, q) => sum + q.total, 0)

    const pendingRevenue = quotes
      .filter(q => q.status === 'sent')
      .reduce((sum, q) => sum + q.total, 0)

    const activeJobs = jobs.filter(j => 
      j.status !== 'delivered' && j.status !== 'shipped'
    ).length

    const completedJobs = jobs.filter(j => 
      j.status === 'delivered'
    ).length

    const customerStats = customers.map(customer => {
      const customerQuotes = quotes.filter(q => q.customer.id === customer.id)
      const customerJobs = jobs.filter(j => j.customer.id === customer.id)
      const totalSpent = customerQuotes
        .filter(q => q.status === 'approved')
        .reduce((sum, q) => sum + q.total, 0)

      return {
        customer,
        quoteCount: customerQuotes.length,
        jobCount: customerJobs.length,
        totalSpent,
      }
    }).sort((a, b) => b.totalSpent - a.totalSpent)

    const statusBreakdown = {
      quotes: {
        draft: quotes.filter(q => q.status === 'draft').length,
        sent: quotes.filter(q => q.status === 'sent').length,
        approved: quotes.filter(q => q.status === 'approved').length,
        rejected: quotes.filter(q => q.status === 'rejected').length,
      },
      jobs: {
        pending: jobs.filter(j => j.status === 'pending').length,
        'art-approval': jobs.filter(j => j.status === 'art-approval').length,
        scheduled: jobs.filter(j => j.status === 'scheduled').length,
        printing: jobs.filter(j => j.status === 'printing').length,
        finishing: jobs.filter(j => j.status === 'finishing').length,
        ready: jobs.filter(j => j.status === 'ready').length,
        shipped: jobs.filter(j => j.status === 'shipped').length,
        delivered: jobs.filter(j => j.status === 'delivered').length,
      }
    }

    return {
      totalRevenue,
      pendingRevenue,
      activeJobs,
      completedJobs,
      customerStats,
      statusBreakdown,
    }
  }, [quotes, jobs, customers])

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <ChartBar size={32} className="text-primary" />
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payment Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CurrencyDollar size={24} className="text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                </div>
                <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">From approved quotes</p>
              </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendUp size={24} className="text-yellow-500" />
              <p className="text-sm font-medium text-muted-foreground">Pending Revenue</p>
            </div>
            <p className="text-3xl font-bold">${stats.pendingRevenue.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">From sent quotes</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package size={24} className="text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
            </div>
            <p className="text-3xl font-bold">{stats.activeJobs}</p>
            <p className="text-sm text-muted-foreground mt-1">In production</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users size={24} className="text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
            </div>
            <p className="text-3xl font-bold">{customers.length}</p>
            <p className="text-sm text-muted-foreground mt-1">{stats.completedJobs} completed jobs</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quote Status Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(stats.statusBreakdown.quotes).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${(count / quotes.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Job Status Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(stats.statusBreakdown.jobs).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${(count / jobs.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Top Customers by Revenue</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b border-border">
              <div>Customer</div>
              <div className="text-right">Quotes</div>
              <div className="text-right">Jobs</div>
              <div className="text-right">Total Spent</div>
            </div>
            {stats.customerStats.slice(0, 10).map((stat) => (
              <div 
                key={stat.customer.id}
                className="grid grid-cols-4 gap-4 text-sm py-2 hover:bg-accent rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="font-medium truncate">
                  {stat.customer.company || stat.customer.name}
                </div>
                <div className="text-right text-muted-foreground">{stat.quoteCount}</div>
                <div className="text-right text-muted-foreground">{stat.jobCount}</div>
                <div className="text-right font-semibold">${stat.totalSpent.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </Card>
          </TabsContent>

          <TabsContent value="payments">
            <UnpaidBalancesReport
              quotes={quotes}
              reminders={paymentReminders}
              onSelectQuote={(quote) => {
                if (onSelectQuote) {
                  onSelectQuote(quote)
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
