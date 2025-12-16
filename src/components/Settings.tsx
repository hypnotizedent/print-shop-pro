import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Download, Palette } from '@phosphor-icons/react'
import type { Quote, Job, Customer } from '@/lib/types'
import { exportQuotesToCSV, exportJobsToCSV, exportCustomersToCSV } from '@/lib/csv-export'

interface SettingsProps {
  quotes: Quote[]
  jobs: Job[]
  customers: Customer[]
}

export function Settings({ quotes, jobs, customers }: SettingsProps) {
  const [primaryColor, setPrimaryColor] = useKV<string>('theme-primary-color', 'oklch(0.7 0.17 166)')
  const [accentColor, setAccentColor] = useKV<string>('theme-accent-color', 'oklch(0.78 0.15 166)')
  
  const [primaryInput, setPrimaryInput] = useState(primaryColor || 'oklch(0.7 0.17 166)')
  const [accentInput, setAccentInput] = useState(accentColor || 'oklch(0.78 0.15 166)')

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

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>
        
        <div className="space-y-6">
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
        </div>
      </div>
    </div>
  )
}
