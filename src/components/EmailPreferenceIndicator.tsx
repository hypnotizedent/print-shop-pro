import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Bell, BellSlash } from '@phosphor-icons/react'
import type { CustomerEmailPreferences } from '@/lib/types'

interface EmailPreferenceIndicatorProps {
  preferences?: CustomerEmailPreferences
  notificationType: keyof CustomerEmailPreferences
  showLabel?: boolean
}

const notificationLabels: Record<keyof CustomerEmailPreferences, string> = {
  quoteApprovalRequests: 'Quote Approval',
  quoteApprovedConfirmations: 'Quote Approved',
  quoteReminders: 'Quote Reminders',
  orderStatusUpdates: 'Order Updates',
  artworkApprovalRequests: 'Artwork Approval',
  artworkStatusUpdates: 'Artwork Updates',
  paymentReminders: 'Payment Reminders',
  paymentConfirmations: 'Payment Confirmations',
  shippingNotifications: 'Shipping',
  pickupNotifications: 'Pickup',
  invoiceReminders: 'Invoice Reminders',
  marketingMessages: 'Marketing',
  productionUpdates: 'Production Updates',
}

export function EmailPreferenceIndicator({
  preferences,
  notificationType,
  showLabel = false,
}: EmailPreferenceIndicatorProps) {
  const isEnabled = preferences ? preferences[notificationType] : true
  const label = notificationLabels[notificationType]

  if (!preferences) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isEnabled ? 'default' : 'secondary'} 
            className="text-xs cursor-help"
          >
            {isEnabled ? <Bell size={12} className="mr-1" /> : <BellSlash size={12} className="mr-1" />}
            {showLabel && label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {isEnabled 
              ? `Customer will receive ${label.toLowerCase()} emails` 
              : `Customer has disabled ${label.toLowerCase()} emails`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
