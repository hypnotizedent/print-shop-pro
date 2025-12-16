import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Download, Palette, DeviceMobile, CheckCircle, Warning, ChatCircle, BellSlash } from '@phosphor-icons/react'
import type { Quote, Job, Customer, SmsTemplate, CustomerSmsPreferences } from '@/lib/types'
import { exportQuotesToCSV, exportJobsToCSV, exportCustomersToCSV } from '@/lib/csv-export'
import { validateTwilioConfig, type TwilioConfig } from '@/lib/twilio-sms'
import { SmsTemplates } from '@/components/SmsTemplates'
import { CustomerSmsOptOuts } from '@/components/CustomerSmsOptOuts'

interface SettingsProps {
  quotes: Quote[]
  jobs: Job[]
  customers: Customer[]
}

export function Settings({ quotes, jobs, customers }: SettingsProps) {
  const [primaryColor, setPrimaryColor] = useKV<string>('theme-primary-color', 'oklch(0.7 0.17 166)')
  const [accentColor, setAccentColor] = useKV<string>('theme-accent-color', 'oklch(0.78 0.15 166)')
  const [twilioConfig, setTwilioConfig] = useKV<TwilioConfig>('twilio-config', {
    accountSid: '',
    authToken: '',
    fromNumber: ''
  })
  const [smsTemplates, setSmsTemplates] = useKV<SmsTemplate[]>('sms-templates', [])
  const [smsPreferences, setSmsPreferences] = useKV<CustomerSmsPreferences[]>('customer-sms-preferences', [])
  
  const [primaryInput, setPrimaryInput] = useState(primaryColor || 'oklch(0.7 0.17 166)')
  const [accentInput, setAccentInput] = useState(accentColor || 'oklch(0.78 0.15 166)')
  const [accountSidInput, setAccountSidInput] = useState(twilioConfig?.accountSid || '')
  const [authTokenInput, setAuthTokenInput] = useState(twilioConfig?.authToken || '')
  const [fromNumberInput, setFromNumberInput] = useState(twilioConfig?.fromNumber || '')

  const isTwilioConfigured = validateTwilioConfig(twilioConfig || {})

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

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <Palette size={16} className="mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="sms">
              <DeviceMobile size={16} className="mr-2" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="templates">
              <ChatCircle size={16} className="mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="opt-outs">
              <BellSlash size={16} className="mr-2" />
              Opt-Outs
            </TabsTrigger>
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
