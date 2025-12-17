import { useState, useMemo, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Download, Palette, DeviceMobile, CheckCircle, Warning, ChatCircle, BellSlash, Envelope, Clock, ShoppingBag, Tag, Percent, ChartLine, Plugs, MagnifyingGlass, X, Sparkle } from '@phosphor-icons/react'
import type { Quote, Job, Customer, SmsTemplate, CustomerSmsPreferences, EmailTemplate, ScheduledEmail, CustomerPricingRule, QuoteTemplate, PurchaseOrder, ImprintTemplate } from '@/lib/types'
import { exportQuotesToCSV, exportJobsToCSV, exportCustomersToCSV } from '@/lib/csv-export'
import { validateTwilioConfig, type TwilioConfig } from '@/lib/twilio-sms'
import { SmsTemplates } from '@/components/SmsTemplates'
import { CustomerSmsOptOuts } from '@/components/CustomerSmsOptOuts'
import { EmailTemplatesManager } from '@/components/EmailTemplatesManager'
import { ScheduledEmailsManager } from '@/components/ScheduledEmailsManager'
import { PricingRulesManager } from '@/components/PricingRulesManager'
import { QuoteTemplateManager } from '@/components/QuoteTemplateManager'
import { PurchaseOrderManager } from '@/components/PurchaseOrderManager'
import { SupplierPerformance } from '@/components/SupplierPerformance'
import { WebhookDashboard } from '@/components/WebhookDashboard'
import { ImprintTemplateManager } from '@/components/ImprintTemplateManager'
import { PrintavoImporter } from '@/components/PrintavoImporter'
import { ssActivewearAPI, type SSActivewearCredentials } from '@/lib/ssactivewear-api'
import { sanMarAPI, type SanMarCredentials } from '@/lib/sanmar-api'
import { WebhookConfig, WebhookEvent, InventoryAlert, WebhookNotification } from '@/lib/webhook-types'

interface SettingsProps {
  quotes: Quote[]
  jobs: Job[]
  customers: Customer[]
  quoteTemplates?: QuoteTemplate[]
  purchaseOrders?: PurchaseOrder[]
  onSaveQuoteTemplate?: (template: QuoteTemplate) => void
  onUpdateQuoteTemplate?: (template: QuoteTemplate) => void
  onDeleteQuoteTemplate?: (templateId: string) => void
  onUseQuoteTemplate?: (template: QuoteTemplate) => void
  onCreatePurchaseOrder?: (po: PurchaseOrder) => void
  onUpdatePurchaseOrder?: (po: PurchaseOrder) => void
  onReceiveInventory?: (po: PurchaseOrder) => void
}

export function Settings({ 
  quotes, 
  jobs, 
  customers,
  quoteTemplates: externalQuoteTemplates,
  purchaseOrders: externalPurchaseOrders,
  onSaveQuoteTemplate: externalSaveQuoteTemplate,
  onUpdateQuoteTemplate: externalUpdateQuoteTemplate,
  onDeleteQuoteTemplate: externalDeleteQuoteTemplate,
  onUseQuoteTemplate: externalUseQuoteTemplate,
  onCreatePurchaseOrder: externalCreatePurchaseOrder,
  onUpdatePurchaseOrder: externalUpdatePurchaseOrder,
  onReceiveInventory: externalReceiveInventory,
}: SettingsProps) {
  const [primaryColor, setPrimaryColor] = useKV<string>('theme-primary-color', 'oklch(0.7 0.17 166)')
  const [accentColor, setAccentColor] = useKV<string>('theme-accent-color', 'oklch(0.78 0.15 166)')
  const [twilioConfig, setTwilioConfig] = useKV<TwilioConfig>('twilio-config', {
    accountSid: '',
    authToken: '',
    fromNumber: ''
  })
  const [ssActivewearCreds, setSSActivewearCreds] = useKV<SSActivewearCredentials>('ssactivewear-credentials', {
    accountNumber: '',
    apiKey: ''
  })
  const [sanMarCreds, setSanMarCreds] = useKV<SanMarCredentials>('sanmar-credentials', {
    customerId: '',
    apiKey: ''
  })
  const [smsTemplates, setSmsTemplates] = useKV<SmsTemplate[]>('sms-templates', [])
  const [smsPreferences, setSmsPreferences] = useKV<CustomerSmsPreferences[]>('customer-sms-preferences', [])
  const [emailTemplates, setEmailTemplates] = useKV<EmailTemplate[]>('email-templates', [])
  const [scheduledEmails, setScheduledEmails] = useKV<ScheduledEmail[]>('scheduled-emails', [])
  const [pricingRules, setPricingRules] = useKV<CustomerPricingRule[]>('customer-pricing-rules', [])
  const [internalQuoteTemplates, setInternalQuoteTemplates] = useKV<QuoteTemplate[]>('quote-templates', [])
  const [internalPurchaseOrders, setInternalPurchaseOrders] = useKV<PurchaseOrder[]>('purchase-orders', [])
  const [webhookConfigs, setWebhookConfigs] = useKV<WebhookConfig[]>('webhook-configs', [])
  const [webhookEvents, setWebhookEvents] = useKV<WebhookEvent[]>('webhook-events', [])
  const [inventoryAlerts, setInventoryAlerts] = useKV<InventoryAlert[]>('inventory-alerts', [])
  const [webhookNotifications, setWebhookNotifications] = useKV<WebhookNotification[]>('webhook-notifications', [])
  const [imprintTemplates, setImprintTemplates] = useKV<ImprintTemplate[]>('imprint-templates', [])
  
  const quoteTemplates = externalQuoteTemplates || internalQuoteTemplates
  const purchaseOrders = externalPurchaseOrders || internalPurchaseOrders
  
  const [primaryInput, setPrimaryInput] = useState(primaryColor || 'oklch(0.7 0.17 166)')
  const [accentInput, setAccentInput] = useState(accentColor || 'oklch(0.78 0.15 166)')
  const [accountSidInput, setAccountSidInput] = useState(twilioConfig?.accountSid || '')
  const [authTokenInput, setAuthTokenInput] = useState(twilioConfig?.authToken || '')
  const [fromNumberInput, setFromNumberInput] = useState(twilioConfig?.fromNumber || '')
  const [ssAccountInput, setSSAccountInput] = useState(ssActivewearCreds?.accountNumber || '')
  const [ssApiKeyInput, setSSApiKeyInput] = useState(ssActivewearCreds?.apiKey || '')
  const [sanMarCustomerInput, setSanMarCustomerInput] = useState(sanMarCreds?.customerId || '')
  const [sanMarApiKeyInput, setSanMarApiKeyInput] = useState(sanMarCreds?.apiKey || '')

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('general')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isTwilioConfigured = validateTwilioConfig(twilioConfig || {})
  const isSSActivewearConfigured = ssActivewearCreds?.accountNumber && ssActivewearCreds?.apiKey
  const isSanMarConfigured = sanMarCreds?.customerId && sanMarCreds?.apiKey

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      
      if (e.key === 'Escape' && searchQuery) {
        e.preventDefault()
        setSearchQuery('')
        searchInputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchQuery])

  const handleSaveTheme = () => {
    setPrimaryColor(primaryInput)
    setAccentColor(accentInput)
    
    document.documentElement.style.setProperty('--primary', primaryInput)
    document.documentElement.style.setProperty('--accent', accentInput)
    
    toast.success('Theme updated!')
  }

  const handleResetTheme = () => {
    const defaultPrimary = 'oklch(0.7 0.17 166)'
    const defaultAccent = 'oklch(0.78 0.15 166)'
    
    setPrimaryInput(defaultPrimary)
    setAccentInput(defaultAccent)
    setPrimaryColor(defaultPrimary)
    setAccentColor(defaultAccent)
    
    document.documentElement.style.setProperty('--primary', defaultPrimary)
    document.documentElement.style.setProperty('--accent', defaultAccent)
    
    toast.success('Theme reset to default')
  }

  const handleExportQuotes = () => {
    exportQuotesToCSV(quotes)
    toast.success('Quotes exported to CSV')
  }

  const handleExportJobs = () => {
    exportJobsToCSV(jobs)
    toast.success('Jobs exported to CSV')
  }

  const handleExportCustomers = () => {
    exportCustomersToCSV(customers)
    toast.success('Customers exported to CSV')
  }

  const handleSaveTwilioConfig = () => {
    const config: TwilioConfig = {
      accountSid: accountSidInput,
      authToken: authTokenInput,
      fromNumber: fromNumberInput
    }

    if (!validateTwilioConfig(config)) {
      toast.error('Invalid Twilio configuration. Please check all fields.')
      return
    }

    setTwilioConfig(config)
    toast.success('Twilio configuration saved!')
  }

  const handleSaveSmsTemplate = (template: SmsTemplate) => {
    setSmsTemplates((current) => {
      const existing = current || []
      const index = existing.findIndex((t) => t.id === template.id)
      if (index >= 0) {
        const updated = [...existing]
        updated[index] = template
        return updated
      } else {
        return [...existing, template]
      }
    })
  }

  const handleDeleteSmsTemplate = (templateId: string) => {
    setSmsTemplates((current) => {
      const existing = current || []
      return existing.filter((t) => t.id !== templateId)
    })
  }

  const handleUpdateSmsPreferences = (preferences: CustomerSmsPreferences) => {
    setSmsPreferences((current) => {
      const existing = current || []
      const index = existing.findIndex((p) => p.customerId === preferences.customerId)
      if (index >= 0) {
        const updated = [...existing]
        updated[index] = preferences
        return updated
      } else {
        return [...existing, preferences]
      }
    })
  }

  const handleSaveEmailTemplate = (template: EmailTemplate) => {
    setEmailTemplates((current) => {
      const existing = current || []
      const index = existing.findIndex((t) => t.id === template.id)
      if (index >= 0) {
        const updated = [...existing]
        updated[index] = template
        return updated
      } else {
        return [...existing, template]
      }
    })
  }

  const handleDeleteEmailTemplate = (templateId: string) => {
    setEmailTemplates((current) => {
      const existing = current || []
      return existing.filter((t) => t.id !== templateId)
    })
  }

  const handleScheduleEmail = (email: ScheduledEmail) => {
    setScheduledEmails((current) => [...(current || []), email])
  }

  const handleCancelScheduledEmail = (emailId: string) => {
    setScheduledEmails((current) => {
      const existing = current || []
      return existing.map((e) => e.id === emailId ? { ...e, status: 'cancelled' as const } : e)
    })
  }

  const handleDeleteScheduledEmail = (emailId: string) => {
    setScheduledEmails((current) => {
      const existing = current || []
      return existing.filter((e) => e.id !== emailId)
    })
  }

  const handleSaveSSActivewearConfig = () => {
    const credentials: SSActivewearCredentials = {
      accountNumber: ssAccountInput.trim(),
      apiKey: ssApiKeyInput.trim()
    }

    if (!credentials.accountNumber || !credentials.apiKey) {
      toast.error('Please provide both Account Number and API Key')
      return
    }

    setSSActivewearCreds(credentials)
    ssActivewearAPI.setCredentials(credentials)
    toast.success('SS Activewear API configured!')
  }

  const handleSaveSanMarConfig = () => {
    const credentials: SanMarCredentials = {
      customerId: sanMarCustomerInput.trim(),
      apiKey: sanMarApiKeyInput.trim()
    }

    if (!credentials.customerId || !credentials.apiKey) {
      toast.error('Please provide both Customer ID and API Key')
      return
    }

    setSanMarCreds(credentials)
    sanMarAPI.setCredentials(credentials)
    toast.success('SanMar API configured!')
  }

  const handleSavePricingRule = (rule: CustomerPricingRule) => {
    setPricingRules((current) => [...(current || []), rule])
  }

  const handleUpdatePricingRule = (rule: CustomerPricingRule) => {
    setPricingRules((current) => {
      const existing = current || []
      return existing.map((r) => r.id === rule.id ? rule : r)
    })
  }

  const handleDeletePricingRule = (ruleId: string) => {
    setPricingRules((current) => {
      const existing = current || []
      return existing.filter((r) => r.id !== ruleId)
    })
  }

  const handleSaveQuoteTemplate = (template: QuoteTemplate) => {
    if (externalSaveQuoteTemplate) {
      externalSaveQuoteTemplate(template)
    } else {
      setInternalQuoteTemplates((current) => [...(current || []), template])
    }
  }

  const handleUpdateQuoteTemplate = (template: QuoteTemplate) => {
    if (externalUpdateQuoteTemplate) {
      externalUpdateQuoteTemplate(template)
    } else {
      setInternalQuoteTemplates((current) => {
        const existing = current || []
        return existing.map((t) => t.id === template.id ? template : t)
      })
    }
  }

  const handleDeleteQuoteTemplate = (templateId: string) => {
    if (externalDeleteQuoteTemplate) {
      externalDeleteQuoteTemplate(templateId)
    } else {
      setInternalQuoteTemplates((current) => {
        const existing = current || []
        return existing.filter((t) => t.id !== templateId)
      })
    }
  }

  const handleUseQuoteTemplate = (template: QuoteTemplate) => {
    if (externalUseQuoteTemplate) {
      externalUseQuoteTemplate(template)
    } else {
      toast.info('Template integration coming soon')
    }
  }

  const handleCreatePurchaseOrder = (po: PurchaseOrder) => {
    if (externalCreatePurchaseOrder) {
      externalCreatePurchaseOrder(po)
    } else {
      setInternalPurchaseOrders((current) => [...(current || []), po])
    }
  }

  const handleUpdatePurchaseOrder = (po: PurchaseOrder) => {
    if (externalUpdatePurchaseOrder) {
      externalUpdatePurchaseOrder(po)
    } else {
      setInternalPurchaseOrders((current) => {
        const existing = current || []
        return existing.map((p) => p.id === po.id ? po : p)
      })
    }
  }

  const handleReceiveInventory = (po: PurchaseOrder) => {
    if (externalReceiveInventory) {
      externalReceiveInventory(po)
    } else {
      setInternalPurchaseOrders((current) => {
        const existing = current || []
        return existing.map((p) => p.id === po.id ? po : p)
      })
    }
  }

  const handleSaveWebhookConfig = (config: WebhookConfig) => {
    setWebhookConfigs((current) => {
      const existing = current || []
      const index = existing.findIndex((c) => c.id === config.id)
      if (index >= 0) {
        const updated = [...existing]
        updated[index] = config
        return updated
      }
      return [...existing, config]
    })
  }

  const handleDeleteWebhookConfig = (configId: string) => {
    setWebhookConfigs((current) => {
      const existing = current || []
      return existing.filter((c) => c.id !== configId)
    })
  }

  const handleToggleWebhookConfig = (configId: string, isActive: boolean) => {
    setWebhookConfigs((current) => {
      const existing = current || []
      return existing.map((c) => c.id === configId ? { ...c, isActive } : c)
    })
  }

  const handleUpdateWebhookEvent = (event: WebhookEvent) => {
    setWebhookEvents((current) => {
      const existing = current || []
      const index = existing.findIndex((e) => e.id === event.id)
      if (index >= 0) {
        const updated = [...existing]
        updated[index] = event
        return updated
      }
      return [event, ...existing]
    })
  }

  const handleAddWebhookEvent = (event: WebhookEvent) => {
    setWebhookEvents((current) => [event, ...(current || [])])
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setInventoryAlerts((current) => {
      const existing = current || []
      return existing.map((a) =>
        a.id === alertId
          ? { ...a, acknowledgedAt: new Date().toISOString(), acknowledgedBy: 'System' }
          : a
      )
    })
  }

  const handleDismissAllAlerts = () => {
    setInventoryAlerts((current) => {
      const existing = current || []
      return existing.map((a) => ({
        ...a,
        acknowledgedAt: a.acknowledgedAt || new Date().toISOString(),
        acknowledgedBy: a.acknowledgedBy || 'System',
      }))
    })
  }

  const handleAddInventoryAlert = (alert: InventoryAlert) => {
    setInventoryAlerts((current) => [alert, ...(current || [])])
  }

  const handleAddWebhookNotification = (notification: WebhookNotification) => {
    setWebhookNotifications((current) => [notification, ...(current || [])])
  }

  const handleSaveImprintTemplate = (template: ImprintTemplate) => {
    setImprintTemplates((current) => [...(current || []), template])
  }

  const handleUpdateImprintTemplate = (template: ImprintTemplate) => {
    setImprintTemplates((current) => {
      const existing = current || []
      return existing.map((t) => (t.id === template.id ? template : t))
    })
  }

  const handleDeleteImprintTemplate = (templateId: string) => {
    setImprintTemplates((current) => {
      const existing = current || []
      return existing.filter((t) => t.id !== templateId)
    })
  }

  const settingsTabs = useMemo(() => [
    {
      value: 'general',
      label: 'General',
      icon: Palette,
      keywords: ['theme', 'color', 'export', 'csv', 'data', 'primary', 'accent', 'customization'],
      description: 'Theme colors and data export'
    },
    {
      value: 'api',
      label: 'Suppliers',
      icon: ShoppingBag,
      keywords: ['ss activewear', 'sanmar', 'api', 'supplier', 'credentials', 'autofill', 'sku', 'products'],
      description: 'Supplier API integrations'
    },
    {
      value: 'webhooks',
      label: 'Webhooks',
      icon: Plugs,
      keywords: ['webhook', 'integration', 'events', 'inventory', 'alerts', 'notifications', 'real-time'],
      description: 'Webhook configurations and monitoring'
    },
    {
      value: 'purchase-orders',
      label: 'Orders',
      icon: ShoppingBag,
      keywords: ['purchase order', 'po', 'receiving', 'inventory', 'supplier orders'],
      description: 'Purchase order management'
    },
    {
      value: 'supplier-performance',
      label: 'Performance',
      icon: ChartLine,
      keywords: ['supplier', 'performance', 'metrics', 'delivery', 'accuracy', 'trends', 'analytics'],
      description: 'Supplier performance analytics'
    },
    {
      value: 'pricing',
      label: 'Pricing',
      icon: Percent,
      keywords: ['pricing', 'rules', 'discount', 'tier', 'customer', 'volume'],
      description: 'Customer pricing rules'
    },
    {
      value: 'quote-templates',
      label: 'Templates',
      icon: Tag,
      keywords: ['quote', 'template', 'presets', 'defaults', 'categories'],
      description: 'Quote templates'
    },
    {
      value: 'imprint-templates',
      label: 'Imprints',
      icon: Sparkle,
      keywords: ['imprint', 'decoration', 'template', 'screen print', 'embroidery', 'dtg', 'setup'],
      description: 'Imprint decoration templates'
    },
    {
      value: 'email-templates',
      label: 'Emails',
      icon: Envelope,
      keywords: ['email', 'template', 'notification', 'message'],
      description: 'Email templates'
    },
    {
      value: 'scheduled-emails',
      label: 'Scheduled',
      icon: Clock,
      keywords: ['scheduled', 'email', 'queue', 'delayed', 'planned'],
      description: 'Scheduled emails'
    },
    {
      value: 'sms',
      label: 'SMS',
      icon: DeviceMobile,
      keywords: ['sms', 'twilio', 'text', 'message', 'phone', 'reminders'],
      description: 'SMS configuration'
    },
    {
      value: 'templates',
      label: 'SMS Templates',
      icon: ChatCircle,
      keywords: ['sms', 'template', 'text message'],
      description: 'SMS message templates'
    },
    {
      value: 'opt-outs',
      label: 'Opt-Outs',
      icon: BellSlash,
      keywords: ['opt out', 'unsubscribe', 'sms', 'preferences'],
      description: 'SMS opt-out management'
    }
  ], [])

  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) {
      return settingsTabs
    }

    const query = searchQuery.toLowerCase().trim()
    return settingsTabs.filter(tab => {
      const matchesLabel = tab.label.toLowerCase().includes(query)
      const matchesKeywords = tab.keywords.some(keyword => keyword.toLowerCase().includes(query))
      const matchesDescription = tab.description.toLowerCase().includes(query)
      return matchesLabel || matchesKeywords || matchesDescription
    })
  }, [searchQuery, settingsTabs])

  const hasSearchResults = filteredTabs.length > 0

  useEffect(() => {
    if (searchQuery && filteredTabs.length > 0 && !filteredTabs.find(tab => tab.value === activeTab)) {
      setActiveTab(filteredTabs[0].value)
    }
  }, [searchQuery, filteredTabs, activeTab])

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          
          <div className="relative">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search settings... (⌘F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </Button>
            )}
          </div>

          {searchQuery && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              {hasSearchResults ? (
                <>
                  <span>Found {filteredTabs.length} matching section{filteredTabs.length !== 1 ? 's' : ''}</span>
                  {filteredTabs.length < settingsTabs.length && (
                    <Badge variant="secondary" className="text-xs">
                      {settingsTabs.length - filteredTabs.length} hidden
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-destructive">No settings found matching &quot;{searchQuery}&quot;</span>
              )}
            </div>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="inline-flex w-full justify-start flex-wrap gap-1 h-auto">
            {filteredTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="flex-shrink-0">
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette size={24} className="text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Theme Customization</h2>
                <p className="text-sm text-muted-foreground">Customize the app's color scheme</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="primary-color"
                    value={primaryInput}
                    onChange={(e) => setPrimaryInput(e.target.value)}
                    placeholder="oklch(0.7 0.17 166)"
                    className="font-mono text-sm"
                  />
                  <div 
                    className="w-12 h-10 rounded border border-border flex-shrink-0"
                    style={{ background: primaryInput }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for buttons, active states, and primary actions
                </p>
              </div>
              
              <div>
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="accent-color"
                    value={accentInput}
                    onChange={(e) => setAccentInput(e.target.value)}
                    placeholder="oklch(0.78 0.15 166)"
                    className="font-mono text-sm"
                  />
                  <div 
                    className="w-12 h-10 rounded border border-border flex-shrink-0"
                    style={{ background: accentInput }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for highlights and hover states
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveTheme}>
                  Save Theme
                </Button>
                <Button variant="outline" onClick={handleResetTheme}>
                  Reset to Default
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Download size={24} className="text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Data Export</h2>
                <p className="text-sm text-muted-foreground">Export data to CSV files</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Quotes</p>
                  <p className="text-sm text-muted-foreground">{quotes.length} quotes</p>
                </div>
                <Button variant="outline" onClick={handleExportQuotes}>
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Jobs</p>
                  <p className="text-sm text-muted-foreground">{jobs.length} jobs</p>
                </div>
                <Button variant="outline" onClick={handleExportJobs}>
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Customers</p>
                  <p className="text-sm text-muted-foreground">{customers.length} customers</p>
                </div>
                <Button variant="outline" onClick={handleExportCustomers}>
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Plugs size={24} className="text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Data Import</h2>
                <p className="text-sm text-muted-foreground">Import data from Printavo or other systems</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Alert className="border-blue-500/30 bg-blue-500/5">
                <AlertDescription className="text-sm">
                  <div className="flex items-start gap-2">
                    <Sparkle size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Import from Printavo</p>
                      <p className="text-muted-foreground">
                        Seamlessly migrate your data from Printavo API v2. Import quotes, invoices, customers, line items, payments, and more. 
                        All Printavo fields are automatically mapped to Mint Prints format.
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Printavo API v2 Data</p>
                  <p className="text-sm text-muted-foreground">
                    Import quotes, jobs, customers from Printavo GraphQL API
                  </p>
                </div>
                <PrintavoImporter />
              </div>

              <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-lg">
                <p className="font-semibold">Supported Printavo Data:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>Quotes & Invoices → Converted to Quotes & Jobs</li>
                  <li>Customers & Contacts → Customer records</li>
                  <li>Line Items & Personalizations → Quote line items with decorations</li>
                  <li>Fees & Transactions → Payments and setup fees</li>
                  <li>Tasks & Expenses → Job production tracking</li>
                </ul>
                <p className="mt-2 pt-2 border-t border-border">
                  Export data from Printavo API v2 in JSON format and import it here. 
                  See <a href="https://www.printavo.com/docs/api/v2" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Printavo API Documentation</a> for details.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-sm text-muted-foreground">
                Mint Prints Dashboard v1.0
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Print shop management system for quotes, jobs, and production tracking
              </p>
            </div>
          </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag size={24} className={isSSActivewearConfigured ? 'text-primary' : 'text-muted-foreground'} />
                <div>
                  <h2 className="text-lg font-semibold">SS Activewear API</h2>
                  <p className="text-sm text-muted-foreground">Enable style autofill from SS Activewear catalog</p>
                </div>
              </div>

              {isSSActivewearConfigured ? (
                <Alert className="mb-4 border-primary/30 bg-primary/5">
                  <CheckCircle size={18} className="text-primary" />
                  <AlertDescription className="text-sm ml-2">
                    SS Activewear API is configured. SKU lookups will autofill product details.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="mb-4 border-yellow-500/30 bg-yellow-500/5">
                  <Warning size={18} className="text-yellow-500" />
                  <AlertDescription className="text-sm ml-2">
                    Configure your SS Activewear API credentials to enable product autofill
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="ss-account">Account Number</Label>
                  <Input
                    id="ss-account"
                    type="text"
                    value={ssAccountInput}
                    onChange={(e) => setSSAccountInput(e.target.value)}
                    placeholder="Your SS Activewear account number"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="ss-apikey">API Key</Label>
                  <Input
                    id="ss-apikey"
                    type="password"
                    value={ssApiKeyInput}
                    onChange={(e) => setSSApiKeyInput(e.target.value)}
                    placeholder="Your SS Activewear API key"
                    className="mt-2"
                  />
                </div>

                <div className="pt-2">
                  <Button onClick={handleSaveSSActivewearConfig}>
                    Save API Configuration
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-medium">How to get your API credentials:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Log in to your SS Activewear account</li>
                    <li>Navigate to Account Settings &gt; API Access</li>
                    <li>Generate or copy your API Key</li>
                    <li>Your Account Number is your login username</li>
                  </ol>
                  <p className="mt-4">
                    <a 
                      href="https://api.ssactivewear.com/V2/Default.aspx" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View API Documentation →
                    </a>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag size={24} className={isSanMarConfigured ? 'text-primary' : 'text-muted-foreground'} />
                <div>
                  <h2 className="text-lg font-semibold">SanMar API</h2>
                  <p className="text-sm text-muted-foreground">Enable style autofill from SanMar catalog</p>
                </div>
              </div>

              {isSanMarConfigured ? (
                <Alert className="mb-4 border-primary/30 bg-primary/5">
                  <CheckCircle size={18} className="text-primary" />
                  <AlertDescription className="text-sm ml-2">
                    SanMar API is configured. SKU lookups will autofill product details.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="mb-4 border-yellow-500/30 bg-yellow-500/5">
                  <Warning size={18} className="text-yellow-500" />
                  <AlertDescription className="text-sm ml-2">
                    Configure your SanMar API credentials to enable product autofill
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="sanmar-customer">Customer ID</Label>
                  <Input
                    id="sanmar-customer"
                    type="text"
                    value={sanMarCustomerInput}
                    onChange={(e) => setSanMarCustomerInput(e.target.value)}
                    placeholder="Your SanMar customer ID"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="sanmar-apikey">API Key</Label>
                  <Input
                    id="sanmar-apikey"
                    type="password"
                    value={sanMarApiKeyInput}
                    onChange={(e) => setSanMarApiKeyInput(e.target.value)}
                    placeholder="Your SanMar API key"
                    className="mt-2"
                  />
                </div>

                <div className="pt-2">
                  <Button onClick={handleSaveSanMarConfig}>
                    Save API Configuration
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-medium">How to get your API credentials:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Log in to your SanMar account</li>
                    <li>Navigate to Account Settings &gt; Electronic Integration</li>
                    <li>Request API access if not already enabled</li>
                    <li>Copy your Customer ID and API Key</li>
                  </ol>
                  <p className="mt-4">
                    <a 
                      href="https://www.sanmar.com/resources/electronicintegration/sanmardatalibrary" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View API Documentation →
                    </a>
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <WebhookDashboard
              configs={webhookConfigs || []}
              events={webhookEvents || []}
              alerts={inventoryAlerts || []}
              notifications={webhookNotifications || []}
              onSaveConfig={handleSaveWebhookConfig}
              onDeleteConfig={handleDeleteWebhookConfig}
              onToggleConfig={handleToggleWebhookConfig}
              onUpdateEvent={handleUpdateWebhookEvent}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onDismissAllAlerts={handleDismissAllAlerts}
              onAddEvent={handleAddWebhookEvent}
              onAddAlert={handleAddInventoryAlert}
              onAddNotification={handleAddWebhookNotification}
            />
          </TabsContent>

          <TabsContent value="purchase-orders" className="space-y-6">
            <PurchaseOrderManager
              purchaseOrders={purchaseOrders || []}
              quotes={quotes}
              jobs={jobs}
              onCreatePurchaseOrder={handleCreatePurchaseOrder}
              onUpdatePurchaseOrder={handleUpdatePurchaseOrder}
              onReceiveInventory={handleReceiveInventory}
            />
          </TabsContent>

          <TabsContent value="supplier-performance" className="space-y-6">
            <SupplierPerformance
              purchaseOrders={purchaseOrders || []}
            />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card className="p-6">
              <PricingRulesManager
                rules={pricingRules || []}
                onSaveRule={handleSavePricingRule}
                onUpdateRule={handleUpdatePricingRule}
                onDeleteRule={handleDeletePricingRule}
              />
            </Card>
          </TabsContent>

          <TabsContent value="quote-templates" className="space-y-6">
            <Card className="p-6">
              <QuoteTemplateManager
                templates={quoteTemplates || []}
                onSaveTemplate={handleSaveQuoteTemplate}
                onUpdateTemplate={handleUpdateQuoteTemplate}
                onDeleteTemplate={handleDeleteQuoteTemplate}
                onUseTemplate={handleUseQuoteTemplate}
              />
            </Card>
          </TabsContent>

          <TabsContent value="imprint-templates" className="space-y-6">
            <Card className="p-6">
              <ImprintTemplateManager
                templates={imprintTemplates || []}
                onSaveTemplate={handleSaveImprintTemplate}
                onUpdateTemplate={handleUpdateImprintTemplate}
                onDeleteTemplate={handleDeleteImprintTemplate}
              />
            </Card>
          </TabsContent>

          <TabsContent value="email-templates" className="space-y-6">
            <Card className="p-6">
              <EmailTemplatesManager
                templates={emailTemplates || []}
                onSaveTemplate={handleSaveEmailTemplate}
                onDeleteTemplate={handleDeleteEmailTemplate}
              />
            </Card>
          </TabsContent>

          <TabsContent value="scheduled-emails" className="space-y-6">
            <Card className="p-6">
              <ScheduledEmailsManager
                scheduledEmails={scheduledEmails || []}
                customers={customers}
                templates={emailTemplates || []}
                onScheduleEmail={handleScheduleEmail}
                onCancelEmail={handleCancelScheduledEmail}
                onDeleteEmail={handleDeleteScheduledEmail}
              />
            </Card>
          </TabsContent>

          <TabsContent value="sms" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <DeviceMobile size={24} className={isTwilioConfigured ? 'text-primary' : 'text-muted-foreground'} />
                <div>
                  <h2 className="text-lg font-semibold">Twilio SMS Configuration</h2>
                  <p className="text-sm text-muted-foreground">Enable SMS reminders for overdue payments</p>
                </div>
              </div>

              {isTwilioConfigured ? (
                <Alert className="mb-4 border-primary/30 bg-primary/5">
                  <CheckCircle size={18} className="text-primary" />
                  <AlertDescription className="text-sm ml-2">
                    Twilio is configured and ready to send SMS reminders
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="mb-4 border-yellow-500/30 bg-yellow-500/5">
                  <Warning size={18} className="text-yellow-500" />
                  <AlertDescription className="text-sm ml-2">
                    SMS reminders are disabled. Configure Twilio to enable high-priority payment reminders.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="twilio-account-sid">Account SID</Label>
                  <Input
                    id="twilio-account-sid"
                    type="password"
                    value={accountSidInput}
                    onChange={(e) => setAccountSidInput(e.target.value)}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="font-mono text-sm mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Find this in your Twilio Console dashboard
                  </p>
                </div>

                <div>
                  <Label htmlFor="twilio-auth-token">Auth Token</Label>
                  <Input
                    id="twilio-auth-token"
                    type="password"
                    value={authTokenInput}
                    onChange={(e) => setAuthTokenInput(e.target.value)}
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="font-mono text-sm mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep this secret and never share it
                  </p>
                </div>

                <div>
                  <Label htmlFor="twilio-from-number">From Phone Number</Label>
                  <Input
                    id="twilio-from-number"
                    type="tel"
                    value={fromNumberInput}
                    onChange={(e) => setFromNumberInput(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="font-mono text-sm mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your Twilio phone number (must include country code)
                  </p>
                </div>

                <div className="pt-2">
                  <Button onClick={handleSaveTwilioConfig}>
                    Save Twilio Configuration
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">How SMS Reminders Work</h3>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>SMS reminders are only sent for high-priority overdue payments</li>
                    <li>Enable SMS in the Payment Reminders section of each quote</li>
                    <li>Mark quotes as "High Priority" to enable SMS capability</li>
                    <li>SMS is sent only when payment is past due date</li>
                    <li>Standard SMS rates apply based on your Twilio plan</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card className="p-6">
              <SmsTemplates
                templates={smsTemplates || []}
                onSaveTemplate={handleSaveSmsTemplate}
                onDeleteTemplate={handleDeleteSmsTemplate}
              />
            </Card>
          </TabsContent>

          <TabsContent value="opt-outs" className="space-y-6">
            <Card className="p-6">
              <CustomerSmsOptOuts
                customers={customers}
                smsPreferences={smsPreferences || []}
                onUpdatePreferences={handleUpdateSmsPreferences}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
