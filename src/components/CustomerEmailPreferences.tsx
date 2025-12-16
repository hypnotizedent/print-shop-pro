import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CustomerEmailPreferences } from '@/lib/types'
import { EnvelopeSimple, EnvelopeOpen, Bell, BellSlash } from '@phosphor-icons/react'
import { useState } from 'react'

interface CustomerEmailPreferencesProps {
  preferences?: CustomerEmailPreferences
  onSave: (preferences: CustomerEmailPreferences) => void
  isEditing: boolean
}

const defaultPreferences: CustomerEmailPreferences = {
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

export function CustomerEmailPreferences({ 
  preferences = defaultPreferences, 
  onSave,
  isEditing
}: CustomerEmailPreferencesProps) {
  const [localPreferences, setLocalPreferences] = useState<CustomerEmailPreferences>(
    preferences || defaultPreferences
  )

  const handleToggle = (key: keyof CustomerEmailPreferences) => {
    const updated = {
      ...localPreferences,
      [key]: !localPreferences[key]
    }
    setLocalPreferences(updated)
    onSave(updated)
  }

  const enabledCount = Object.values(localPreferences).filter(Boolean).length
  const totalCount = Object.keys(localPreferences).length

  const preferenceGroups = [
    {
      title: 'Quotes & Approvals',
      icon: <EnvelopeSimple size={18} />,
      preferences: [
        { key: 'quoteApprovalRequests' as const, label: 'Quote Approval Requests', description: 'When a quote is ready for customer approval' },
        { key: 'quoteApprovedConfirmations' as const, label: 'Quote Approved Confirmations', description: 'Confirmation when quote is approved' },
        { key: 'quoteReminders' as const, label: 'Quote Follow-up Reminders', description: 'Reminders for pending quotes (3 days, 7 days)' },
      ]
    },
    {
      title: 'Order & Production',
      icon: <Bell size={18} />,
      preferences: [
        { key: 'orderStatusUpdates' as const, label: 'Order Status Updates', description: 'Status changes (scheduled, printing, finishing, etc.)' },
        { key: 'productionUpdates' as const, label: 'Production Updates', description: 'Detailed production progress notifications' },
        { key: 'shippingNotifications' as const, label: 'Shipping Notifications', description: 'Tracking information when order ships' },
        { key: 'pickupNotifications' as const, label: 'Pickup Notifications', description: 'Ready for pickup alerts' },
      ]
    },
    {
      title: 'Artwork & Design',
      icon: <EnvelopeOpen size={18} />,
      preferences: [
        { key: 'artworkApprovalRequests' as const, label: 'Artwork Approval Requests', description: 'When artwork mockups need approval' },
        { key: 'artworkStatusUpdates' as const, label: 'Artwork Status Updates', description: 'Artwork approved/rejected notifications' },
      ]
    },
    {
      title: 'Payments & Invoices',
      icon: <EnvelopeSimple size={18} />,
      preferences: [
        { key: 'paymentReminders' as const, label: 'Payment Reminders', description: 'Reminders for unpaid balances' },
        { key: 'paymentConfirmations' as const, label: 'Payment Confirmations', description: 'Receipt confirmations when payments received' },
        { key: 'invoiceReminders' as const, label: 'Invoice Reminders', description: 'Invoice follow-ups (7, 14, 30 days)' },
      ]
    },
    {
      title: 'Marketing & Promotions',
      icon: <EnvelopeSimple size={18} />,
      preferences: [
        { key: 'marketingMessages' as const, label: 'Marketing Messages', description: 'Promotional emails and special offers' },
      ]
    },
  ]

  if (!isEditing) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
            Email Preferences
          </h2>
          <Badge variant="outline" className="text-xs">
            {enabledCount} of {totalCount} enabled
          </Badge>
        </div>
        
        <div className="space-y-4">
          {preferenceGroups.map((group) => (
            <div key={group.title}>
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                {group.icon}
                <span>{group.title}</span>
              </div>
              <div className="pl-6 space-y-2">
                {group.preferences.map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between text-sm">
                    <span className={localPreferences[pref.key] ? 'text-foreground' : 'text-muted-foreground'}>
                      {pref.label}
                    </span>
                    <Badge variant={localPreferences[pref.key] ? 'default' : 'secondary'} className="text-xs">
                      {localPreferences[pref.key] ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
          Email Preferences
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {enabledCount} of {totalCount} enabled
          </Badge>
        </div>
      </div>
      
      <div className="space-y-6">
        {preferenceGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium border-b border-border pb-2">
              {group.icon}
              <span>{group.title}</span>
            </div>
            <div className="space-y-3 pl-6">
              {group.preferences.map((pref) => (
                <div key={pref.key} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label htmlFor={pref.key} className="text-sm font-medium cursor-pointer">
                      {pref.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pref.description}
                    </p>
                  </div>
                  <Switch
                    id={pref.key}
                    checked={localPreferences[pref.key]}
                    onCheckedChange={() => handleToggle(pref.key)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <EnvelopeSimple size={16} />
          <span>Changes are saved automatically</span>
        </div>
      </div>
    </Card>
  )
}
