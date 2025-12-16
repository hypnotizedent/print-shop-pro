import type { CustomerEmailPreferences } from './types'

export const getDefaultEmailPreferences = (): CustomerEmailPreferences => ({
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
})

export const shouldSendEmail = (
  preferences: CustomerEmailPreferences | undefined,
  notificationType: keyof CustomerEmailPreferences
): boolean => {
  if (!preferences) {
    const defaultPrefs = getDefaultEmailPreferences()
    return defaultPrefs[notificationType]
  }
  
  return preferences[notificationType]
}
