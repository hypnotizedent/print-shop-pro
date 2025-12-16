import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Login } from '@/components/Login'
import { QuotesList } from '@/components/QuotesList'
import { QuoteBuilder } from '@/components/QuoteBuilder'
import { JobsBoard } from '@/components/JobsBoard'
import { CustomersList } from '@/components/CustomersList'
import { CustomerDetail } from '@/components/CustomerDetail'
import { 
  FileText, 
  Briefcase, 
  Users, 
  ChartBar,
  Sparkle,
  SignOut
} from '@phosphor-icons/react'
import type { Quote, Job, Customer, JobStatus, ArtworkFile } from '@/lib/types'
import { 
  sampleCustomers, 
  sampleQuotes, 
  sampleJobs,
  createEmptyQuote,
  generateJobNumber,
  generateId
} from '@/lib/data'

type View = 'dashboard' | 'quotes' | 'jobs' | 'customers' | 'reports'
type Page = 
  | { type: 'list'; view: View }
  | { type: 'quote-builder'; quote: Quote; fromCustomerId?: string }
  | { type: 'customer-detail'; customer: Customer }

function App() {
  const [isLoggedIn, setIsLoggedIn] = useKV<boolean>('is-logged-in', true)
  const [quotes, setQuotes] = useKV<Quote[]>('quotes', sampleQuotes)
  const [jobs, setJobs] = useKV<Job[]>('jobs', sampleJobs)
  const [customers, setCustomers] = useKV<Customer[]>('customers', sampleCustomers)
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'list', view: 'quotes' })
  
  const handleLogin = (email: string, password: string) => {
    setIsLoggedIn(true)
    toast.success('Welcome back!')
  }
  
  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage({ type: 'list', view: 'quotes' })
    toast.success('Logged out')
  }
  
  const handleSaveQuote = (quote: Quote) => {
    setQuotes((current) => {
      const existing = current || []
      const index = existing.findIndex(q => q.id === quote.id)
      if (index >= 0) {
        const updated = [...existing]
        updated[index] = quote
        return updated
      } else {
        return [...existing, quote]
      }
    })
  }
  
  const handleCreateCustomer = (customer: Customer) => {
    setCustomers((current) => [...(current || []), customer])
  }
  
  const handleUpdateCustomer = (customer: Customer) => {
    setCustomers((current) => {
      const existing = current || []
      return existing.map(c => c.id === customer.id ? customer : c)
    })
  }
  
  const handleNewQuote = () => {
    const newQuote = createEmptyQuote()
    setCurrentPage({ type: 'quote-builder', quote: newQuote })
  }
  
  const handleSelectQuote = (quote: Quote) => {
    setCurrentPage({ type: 'quote-builder', quote, fromCustomerId: undefined })
  }
  
  const handleSelectQuoteFromCustomer = (quote: Quote, customerId: string) => {
    setCurrentPage({ type: 'quote-builder', quote, fromCustomerId: customerId })
  }
  
  const handleSelectCustomer = (customer: Customer) => {
    setCurrentPage({ type: 'customer-detail', customer })
  }
  
  const handleUpdateJobStatus = (jobId: string, status: JobStatus) => {
    setJobs((current) => {
      const existing = current || []
      return existing.map(j => j.id === jobId ? { ...j, status } : j)
    })
    toast.success('Job status updated')
  }

  const handleUpdateJobArtwork = (jobId: string, itemId: string, artwork: ArtworkFile[]) => {
    setJobs((current) => {
      const existing = current || []
      const updatedJobs = existing.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            line_items: j.line_items.map(item => 
              item.id === itemId ? { ...item, artwork } : item
            )
          }
        }
        return j
      })

      const job = updatedJobs.find(j => j.id === jobId)
      const allApproved = artwork.every(a => a.approved)
      if (allApproved && artwork.length > 0) {
        const allItemsApproved = job?.line_items.every(item => 
          (item.artwork || []).every(a => a.approved)
        )
        if (allItemsApproved) {
          setTimeout(() => toast.success('All artwork approved!'), 100)
        }
      }

      return updatedJobs
    })
  }
  
  const handleConvertToJob = (quote: Quote) => {
    const newJob: Job = {
      id: generateId('j'),
      job_number: generateJobNumber(),
      quote_id: quote.id,
      status: 'pending',
      customer: quote.customer,
      line_items: quote.line_items,
      due_date: quote.due_date,
      ship_date: '',
      production_notes: quote.notes_internal || '',
      artwork_approved: false,
      assigned_to: [],
      progress: 0,
    }
    
    setJobs((current) => [...(current || []), newJob])
    
    setQuotes((current) => {
      const existing = current || []
      return existing.map(q => q.id === quote.id ? { ...q, status: 'approved' as const } : q)
    })
    
    toast.success('Quote converted to job!')
    setCurrentPage({ type: 'list', view: 'jobs' })
  }
  
  const navItems = [
    { id: 'quotes' as const, label: 'Quotes', icon: FileText },
    { id: 'jobs' as const, label: 'Jobs', icon: Briefcase },
    { id: 'customers' as const, label: 'Customers', icon: Users },
    { id: 'reports' as const, label: 'Reports', icon: ChartBar },
  ]
  
  const currentView = currentPage.type === 'list' ? currentPage.view : null
  
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }
  
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Toaster position="top-right" />
      
      <header className="border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkle size={28} weight="fill" className="text-primary" />
          <h1 className="text-xl font-bold tracking-tight">MINT PRINTS</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <SignOut size={18} className="mr-2" />
          Logout
        </Button>
      </header>
      
      <div className="flex-1 flex min-h-0">
        <aside className="w-56 border-r border-border flex-shrink-0 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage({ type: 'list', view: item.id })}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>
        
        <main className="flex-1 min-w-0">
          {currentPage.type === 'list' && currentPage.view === 'quotes' && (
            <QuotesList
              quotes={quotes || []}
              customers={customers || []}
              onSelectQuote={handleSelectQuote}
              onNewQuote={handleNewQuote}
              onSaveQuote={handleSaveQuote}
              onCreateCustomer={handleCreateCustomer}
              onConvertToJob={handleConvertToJob}
            />
          )}
          
          {currentPage.type === 'list' && currentPage.view === 'jobs' && (
            <JobsBoard
              jobs={jobs || []}
              customers={customers || []}
              onUpdateJobStatus={handleUpdateJobStatus}
              onUpdateJobArtwork={handleUpdateJobArtwork}
              onNavigateToCustomer={(customerId) => {
                const customer = customers?.find(c => c.id === customerId)
                if (customer) {
                  setCurrentPage({ type: 'customer-detail', customer })
                }
              }}
            />
          )}
          
          {currentPage.type === 'list' && currentPage.view === 'customers' && (
            <CustomersList
              customers={customers || []}
              quotes={quotes || []}
              jobs={jobs || []}
              onSelectCustomer={handleSelectCustomer}
              onNewCustomer={() => {
                const newCustomer: Customer = {
                  id: generateId('c'),
                  name: '',
                  email: '',
                }
                setCurrentPage({ type: 'customer-detail', customer: newCustomer })
              }}
            />
          )}
          
          {currentPage.type === 'list' && currentPage.view === 'reports' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <ChartBar size={64} className="mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Reports & Analytics</h2>
                <p className="text-muted-foreground">Coming soon</p>
              </div>
            </div>
          )}
          
          {currentPage.type === 'quote-builder' && (
            <QuoteBuilder
              quote={currentPage.quote}
              customers={customers || []}
              onSave={handleSaveQuote}
              onBack={() => {
                if (currentPage.fromCustomerId) {
                  const customer = customers?.find(c => c.id === currentPage.fromCustomerId)
                  if (customer) {
                    setCurrentPage({ type: 'customer-detail', customer })
                  } else {
                    setCurrentPage({ type: 'list', view: 'quotes' })
                  }
                } else {
                  setCurrentPage({ type: 'list', view: 'quotes' })
                }
              }}
              onCreateCustomer={handleCreateCustomer}
              onNavigateToCustomer={currentPage.quote.customer.id ? () => {
                const customer = customers?.find(c => c.id === currentPage.quote.customer.id)
                if (customer) {
                  setCurrentPage({ type: 'customer-detail', customer })
                }
              } : undefined}
            />
          )}
          
          {currentPage.type === 'customer-detail' && (
            <CustomerDetail
              customer={currentPage.customer}
              quotes={quotes || []}
              jobs={jobs || []}
              onBack={() => setCurrentPage({ type: 'list', view: 'customers' })}
              onUpdateCustomer={handleUpdateCustomer}
              onSelectQuote={(quote) => handleSelectQuoteFromCustomer(quote, currentPage.customer.id)}
              onSelectJob={(job) => setCurrentPage({ type: 'list', view: 'jobs' })}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App