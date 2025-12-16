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
import { Settings } from '@/components/Settings'
import { Reports } from '@/components/Reports'
import { GlobalSearch } from '@/components/GlobalSearch'
import { 
  FileText, 
  Briefcase, 
  Users, 
  ChartBar,
  Sparkle,
  SignOut,
  Gear,
} from '@phosphor-icons/react'
import type { Quote, Job, Customer, JobStatus, QuoteStatus, LegacyArtworkFile, CustomerDecorationTemplate, Expense, PaymentReminder, CustomerArtworkFile, EmailNotification } from '@/lib/types'
import { 
  sampleCustomers, 
  sampleQuotes, 
  sampleJobs,
  sampleEmailNotifications,
  createEmptyQuote,
  generateJobNumber,
  generateId
} from '@/lib/data'
import { createQuoteApprovalEmail, createQuoteApprovedEmail, createInvoiceEmail } from '@/lib/email-notifications'

type View = 'quotes' | 'jobs' | 'customers' | 'reports' | 'settings'
type Page = 
  | { type: 'list'; view: View }
  | { type: 'quote-builder'; quote: Quote; fromCustomerId?: string }
  | { type: 'customer-detail'; customer: Customer }

function App() {
  const [isLoggedIn, setIsLoggedIn] = useKV<boolean>('is-logged-in', true)
  const [quotes, setQuotes] = useKV<Quote[]>('quotes', sampleQuotes)
  const [jobs, setJobs] = useKV<Job[]>('jobs', sampleJobs)
  const [customers, setCustomers] = useKV<Customer[]>('customers', sampleCustomers)
  const [customerTemplates, setCustomerTemplates] = useKV<CustomerDecorationTemplate[]>('customer-decoration-templates', [])
  const [paymentReminders, setPaymentReminders] = useKV<PaymentReminder[]>('payment-reminders', [])
  const [customerArtworkFiles, setCustomerArtworkFiles] = useKV<CustomerArtworkFile[]>('customer-artwork-files', [])
  const [emailNotifications, setEmailNotifications] = useKV<EmailNotification[]>('email-notifications', sampleEmailNotifications)
  const [emailTemplates, setEmailTemplates] = useKV<import('@/lib/types').EmailTemplate[]>('email-templates', [])
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'list', view: 'quotes' })
  
  useEffect(() => {
    const primaryColor = localStorage.getItem('theme-primary-color')
    const accentColor = localStorage.getItem('theme-accent-color')
    
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary', primaryColor)
    }
    if (accentColor) {
      document.documentElement.style.setProperty('--accent', accentColor)
    }
  }, [])

  useEffect(() => {
    if (customerArtworkFiles && customerArtworkFiles.length > 0) {
      const needsMigration = customerArtworkFiles.some(
        (file) => file.currentVersion === undefined
      )
      
      if (needsMigration) {
        setCustomerArtworkFiles((current) => {
          return (current || []).map((file) => {
            if (file.currentVersion === undefined) {
              return {
                ...file,
                currentVersion: 1,
                versionHistory: [],
              }
            }
            return file
          })
        })
      }
    }
  }, [])

  useEffect(() => {
    if (customers && customers.length > 0) {
      const needsEmailPreferences = customers.some(
        (customer) => !customer.emailPreferences
      )
      
      if (needsEmailPreferences) {
        setCustomers((current) => {
          return (current || []).map((customer) => {
            if (!customer.emailPreferences) {
              return {
                ...customer,
                emailPreferences: {
                  quoteApprovalRequests: true,
                  quoteApprovedConfirmations: true,
                  quoteReminders: true,
                  orderStatusUpdates: true,
                  artworkApprovalRequests: true,
                  artworkStatusUpdates: true,
                  paymentReminders: true,
                  paymentConfirmations: true,
                  shippingNotifications: true,
                  pickupNotifications: true,
                  invoiceReminders: true,
                  marketingMessages: false,
                  productionUpdates: false,
                }
              }
            }
            return customer
          })
        })
      }
    }
  }, [])
  
  const handleLogin = (email: string, password: string) => {
    setIsLoggedIn(true)
    toast.success('Welcome back!')
  }
  
  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage({ type: 'list', view: 'quotes' })
    toast.success('Logged out')
  }

  const addEmailNotification = (notification: EmailNotification) => {
    setEmailNotifications((current) => [...(current || []), notification])
  }
  
  const handleSaveQuote = (quote: Quote) => {
    setQuotes((current) => {
      const existing = current || []
      const index = existing.findIndex(q => q.id === quote.id)
      const oldQuote = index >= 0 ? existing[index] : null
      
      if (index >= 0) {
        const updated = [...existing]
        updated[index] = quote
        
        if (oldQuote && oldQuote.status !== quote.status && quote.customer.email) {
          if (quote.status === 'sent' && quote.customer.emailPreferences?.quoteApprovalRequests !== false) {
            const emailNotification = createQuoteApprovalEmail(quote, 'System')
            addEmailNotification(emailNotification)
            toast.success(`Quote approval email sent to ${quote.customer.email}`)
          } else if (quote.status === 'approved' && quote.customer.emailPreferences?.quoteApprovedConfirmations !== false) {
            const emailNotification = createQuoteApprovedEmail(quote, 'System')
            addEmailNotification(emailNotification)
            toast.success(`Quote approved email sent to ${quote.customer.email}`)
          }
        }
        
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

  const handleUpdateJobNickname = (jobId: string, nickname: string) => {
    setJobs((current) => {
      const existing = current || []
      return existing.map(j => j.id === jobId ? { ...j, nickname } : j)
    })
  }

  const handleUpdateJobExpenses = (jobId: string, expenses: Expense[]) => {
    setJobs((current) => {
      const existing = current || []
      return existing.map(j => j.id === jobId ? { ...j, expenses } : j)
    })
  }

  const handleUpdateJobArtwork = (jobId: string, itemId: string, artwork: LegacyArtworkFile[]) => {
    setJobs((current) => {
      const existing = current || []
      const job = existing.find(j => j.id === jobId)
      const item = job?.line_items.find(i => i.id === itemId)
      const oldArtwork = item?.artwork || []
      
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

      const updatedJob = updatedJobs.find(j => j.id === jobId)
      
      const newlyApproved = artwork.filter(a => {
        const oldVersion = oldArtwork.find(old => old.location === a.location)
        return a.approved && (!oldVersion || !oldVersion.approved)
      })
      
      const newlyRejected = artwork.filter(a => {
        const oldVersion = oldArtwork.find(old => old.location === a.location)
        return !a.approved && oldVersion && oldVersion.approved
      })
      
      if (newlyApproved.length > 0) {
        const locations = newlyApproved.map(a => a.location).join(', ')
        toast.success(
          `Artwork approved for ${locations}`,
          {
            description: `Job ${job?.job_number} - ${item?.product_name}`,
            duration: 4000,
          }
        )
      }
      
      if (newlyRejected.length > 0) {
        const locations = newlyRejected.map(a => a.location).join(', ')
        toast.warning(
          `Artwork approval revoked for ${locations}`,
          {
            description: `Job ${job?.job_number} - ${item?.product_name}`,
            duration: 4000,
          }
        )
      }
      
      const allItemsApproved = updatedJob?.line_items.every(item => {
        const artworkList = item.artwork || []
        return artworkList.length > 0 && artworkList.every(a => a.approved)
      })
      
      if (allItemsApproved && updatedJob) {
        const totalArtwork = updatedJob.line_items.reduce(
          (sum, item) => sum + (item.artwork || []).length, 
          0
        )
        setTimeout(() => {
          toast.success(
            `All artwork approved! (${totalArtwork} files)`,
            {
              description: `Job ${updatedJob.job_number} is ready for production`,
              duration: 5000,
            }
          )
        }, 100)
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
      nickname: quote.nickname,
    }
    
    setJobs((current) => [...(current || []), newJob])
    
    setQuotes((current) => {
      const existing = current || []
      return existing.map(q => q.id === quote.id ? { ...q, status: 'approved' as const } : q)
    })
    
    toast.success('Quote converted to job!')
    setCurrentPage({ type: 'list', view: 'jobs' })
  }
  
  const handleDeleteQuotes = (quoteIds: string[]) => {
    setQuotes((current) => {
      const existing = current || []
      return existing.filter(q => !quoteIds.includes(q.id))
    })
  }
  
  const handleBulkQuoteStatusChange = (quoteIds: string[], status: QuoteStatus) => {
    setQuotes((current) => {
      const existing = current || []
      const updatedQuotes = existing.map(q => {
        if (quoteIds.includes(q.id)) {
          const updatedQuote = { ...q, status }
          
          if (q.status !== status && q.customer.email) {
            if (status === 'sent' && q.customer.emailPreferences?.quoteApprovalRequests !== false) {
              const emailNotification = createQuoteApprovalEmail(updatedQuote, 'System')
              addEmailNotification(emailNotification)
            } else if (status === 'approved' && q.customer.emailPreferences?.quoteApprovedConfirmations !== false) {
              const emailNotification = createQuoteApprovedEmail(updatedQuote, 'System')
              addEmailNotification(emailNotification)
            }
          }
          
          return updatedQuote
        }
        return q
      })
      
      const emailCount = quoteIds.filter(id => {
        const quote = existing.find(q => q.id === id)
        return quote && quote.customer.email
      }).length
      
      if (emailCount > 0) {
        toast.success(`${emailCount} email notification${emailCount > 1 ? 's' : ''} sent`)
      }
      
      return updatedQuotes
    })
  }
  
  const handleDeleteJobs = (jobIds: string[]) => {
    setJobs((current) => {
      const existing = current || []
      return existing.filter(j => !jobIds.includes(j.id))
    })
  }
  
  const handleBulkJobStatusChange = (jobIds: string[], status: JobStatus) => {
    setJobs((current) => {
      const existing = current || []
      return existing.map(j => jobIds.includes(j.id) ? { ...j, status } : j)
    })
  }
  
  const handleSearchSelectQuote = (quote: Quote) => {
    setCurrentPage({ type: 'quote-builder', quote })
  }
  
  const handleSearchSelectJob = (job: Job) => {
    setCurrentPage({ type: 'list', view: 'jobs' })
  }
  
  const handleSearchSelectCustomer = (customer: Customer) => {
    setCurrentPage({ type: 'customer-detail', customer })
  }
  
  const handleSaveDecorationTemplate = (template: CustomerDecorationTemplate) => {
    setCustomerTemplates((current) => [...(current || []), template])
    toast.success(`Template "${template.name}" saved`)
  }

  const handleUpdatePaymentReminder = (reminder: PaymentReminder) => {
    setPaymentReminders((current) => {
      const existing = current || []
      const index = existing.findIndex(r => r.quoteId === reminder.quoteId)
      if (index >= 0) {
        const updated = [...existing]
        updated[index] = reminder
        return updated
      } else {
        return [...existing, reminder]
      }
    })
  }

  const handleSaveArtworkFile = (artwork: CustomerArtworkFile) => {
    setCustomerArtworkFiles((current) => [...(current || []), artwork])
  }

  const handleDeleteArtworkFile = (artworkId: string) => {
    setCustomerArtworkFiles((current) => {
      const existing = current || []
      return existing.filter(a => a.id !== artworkId)
    })
  }

  const handleUpdateArtworkFile = (artwork: CustomerArtworkFile) => {
    setCustomerArtworkFiles((current) => {
      const existing = current || []
      return existing.map(a => a.id === artwork.id ? artwork : a)
    })
  }
  
  const navItems = [
    { id: 'quotes' as const, label: 'Quotes', icon: FileText },
    { id: 'jobs' as const, label: 'Jobs', icon: Briefcase },
    { id: 'customers' as const, label: 'Customers', icon: Users },
    { id: 'reports' as const, label: 'Reports', icon: ChartBar },
    { id: 'settings' as const, label: 'Settings', icon: Gear },
  ]
  
  const currentView = currentPage.type === 'list' ? currentPage.view : null
  
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }
  
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Toaster position="top-right" />
      
      <header className="border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Sparkle size={28} weight="fill" className="text-primary" />
          <h1 className="text-lg md:text-xl font-bold tracking-tight hidden sm:block">MINT PRINTS</h1>
          <h1 className="text-lg font-bold tracking-tight sm:hidden">MINT</h1>
        </div>
        <div className="flex-1 max-w-md mx-auto">
          <GlobalSearch
            quotes={quotes || []}
            jobs={jobs || []}
            customers={customers || []}
            onSelectQuote={handleSearchSelectQuote}
            onSelectJob={handleSearchSelectJob}
            onSelectCustomer={handleSearchSelectCustomer}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="flex-shrink-0">
          <SignOut size={18} className="md:mr-2" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </header>
      
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <aside className="w-14 md:w-56 border-r border-border flex-shrink-0 p-2 md:p-4 overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage({ type: 'list', view: item.id })}
                  className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                  title={item.label}
                >
                  <Icon size={20} />
                  <span className="hidden md:inline">{item.label}</span>
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
              onDeleteQuotes={handleDeleteQuotes}
              onBulkStatusChange={handleBulkQuoteStatusChange}
            />
          )}
          
          {currentPage.type === 'list' && currentPage.view === 'jobs' && (
            <JobsBoard
              jobs={jobs || []}
              customers={customers || []}
              onUpdateJobStatus={handleUpdateJobStatus}
              onUpdateJobArtwork={handleUpdateJobArtwork}
              onUpdateJobNickname={handleUpdateJobNickname}
              onUpdateJobExpenses={handleUpdateJobExpenses}
              onNavigateToCustomer={(customerId) => {
                const customer = customers?.find(c => c.id === customerId)
                if (customer) {
                  setCurrentPage({ type: 'customer-detail', customer })
                }
              }}
              onDeleteJobs={handleDeleteJobs}
              onBulkStatusChange={handleBulkJobStatusChange}
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
            <Reports
              quotes={quotes || []}
              jobs={jobs || []}
              customers={customers || []}
              paymentReminders={paymentReminders || []}
              emailNotifications={emailNotifications || []}
              onSelectQuote={(quote) => {
                setCurrentPage({ type: 'quote-builder', quote })
              }}
            />
          )}
          
          {currentPage.type === 'list' && currentPage.view === 'settings' && (
            <Settings
              quotes={quotes || []}
              jobs={jobs || []}
              customers={customers || []}
            />
          )}
          
          {currentPage.type === 'quote-builder' && (
            <QuoteBuilder
              quote={currentPage.quote}
              customers={customers || []}
              quotes={quotes || []}
              customerTemplates={customerTemplates || []}
              customerArtworkFiles={customerArtworkFiles || []}
              paymentReminders={paymentReminders || []}
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
              onSaveDecorationTemplate={handleSaveDecorationTemplate}
              onUpdateReminder={handleUpdatePaymentReminder}
              onNavigateToCustomer={currentPage.quote.customer.id ? () => {
                const customer = customers?.find(c => c.id === currentPage.quote.customer.id)
                if (customer) {
                  setCurrentPage({ type: 'customer-detail', customer })
                }
              } : undefined}
              onDuplicateQuote={(duplicatedQuote) => {
                handleSaveQuote(duplicatedQuote)
                setCurrentPage({ type: 'quote-builder', quote: duplicatedQuote })
              }}
            />
          )}
          
          {currentPage.type === 'customer-detail' && (
            <CustomerDetail
              customer={currentPage.customer}
              quotes={quotes || []}
              jobs={jobs || []}
              customerArtworkFiles={customerArtworkFiles || []}
              emailNotifications={emailNotifications || []}
              emailTemplates={emailTemplates || []}
              onBack={() => setCurrentPage({ type: 'list', view: 'customers' })}
              onUpdateCustomer={handleUpdateCustomer}
              onSelectQuote={(quote) => handleSelectQuoteFromCustomer(quote, currentPage.customer.id)}
              onSelectJob={(job) => setCurrentPage({ type: 'list', view: 'jobs' })}
              onSaveArtworkFile={handleSaveArtworkFile}
              onDeleteArtworkFile={handleDeleteArtworkFile}
              onUpdateArtworkFile={handleUpdateArtworkFile}
              onSendEmail={addEmailNotification}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App