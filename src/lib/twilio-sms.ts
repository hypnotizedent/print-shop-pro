import type { Quote, PaymentReminder } from './types'

export interface TwilioConfig {
  accountSid: string
  authToken: string
  fromNumber: string
}

export interface SmsMessage {
  to: string
  body: string
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }
  
  if (cleaned.startsWith('+')) {
    return phone
  }
  
  return `+${cleaned}`
}

export function createPaymentReminderSms(
  quote: Quote,
  remainingBalance: number
): string {
  const quoteName = quote.nickname || quote.quote_number
  const dueDate = quote.due_date 
    ? new Date(quote.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''
  
  const dueDateText = dueDate ? ` Due: ${dueDate}.` : ''
  
  return `MINT PRINTS: Payment reminder for Quote #${quoteName}. Balance due: $${remainingBalance.toFixed(2)}.${dueDateText} Please submit payment soon. Reply STOP to opt out.`
}

export function shouldSendSmsReminder(
  quote: Quote,
  reminder: PaymentReminder | undefined,
  remainingBalance: number
): boolean {
  if (!reminder?.smsEnabled || !reminder.highPriority) {
    return false
  }
  
  if (remainingBalance <= 0) {
    return false
  }
  
  if (!quote.due_date) {
    return false
  }
  
  const dueDate = new Date(quote.due_date)
  const now = new Date()
  const isOverdue = now > dueDate
  
  return isOverdue
}

export async function sendTwilioSms(
  config: TwilioConfig,
  message: SmsMessage
): Promise<{ success: boolean; error?: string; sid?: string }> {
  try {
    const formattedTo = formatPhoneNumber(message.to)
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${config.accountSid}:${config.authToken}`)
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: config.fromNumber,
          Body: message.body
        })
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      }
    }
    
    const result = await response.json()
    return {
      success: true,
      sid: result.sid
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export function validateTwilioConfig(config: Partial<TwilioConfig>): boolean {
  return !!(
    config.accountSid &&
    config.authToken &&
    config.fromNumber &&
    config.accountSid.startsWith('AC') &&
    config.fromNumber.match(/^\+?1?\d{10,}$/)
  )
}

export function getSmsPreview(quote: Quote, remainingBalance: number): string {
  return createPaymentReminderSms(quote, remainingBalance)
}
