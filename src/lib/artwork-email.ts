import type { Job, LegacyArtworkFile } from './types'

export interface ArtworkNotificationOptions {
  job: Job
  itemId: string
  artwork: LegacyArtworkFile
  approved: boolean
}

export function sendArtworkNotificationEmail(options: ArtworkNotificationOptions): boolean {
  const { job, itemId, artwork, approved } = options
  const item = job.line_items.find(i => i.id === itemId)
  
  if (!item) return false
  
  const customerEmail = job.customer.email
  const status = approved ? 'APPROVED' : 'REJECTED'
  const statusEmoji = approved ? '✅' : '❌'
  
  const subject = `${statusEmoji} Artwork ${status} - ${job.job_number}${job.nickname ? ` - ${job.nickname}` : ''}`
  
  const body = `
Hello ${job.customer.name},

Your artwork has been ${approved ? 'approved' : 'rejected'} for the following job:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Job Number: ${job.job_number}
${job.nickname ? `Project Name: ${job.nickname}\n` : ''}
Product: ${item.product_name}${item.product_color ? ` (${item.product_color})` : ''}
Location: ${artwork.location}
Artwork File: ${artwork.fileName}

${approved 
  ? `✅ APPROVED - Your artwork looks great! We're moving forward with production.` 
  : `❌ REJECTED - Please review and resubmit your artwork. We'll contact you with specific feedback.`}

Due Date: ${new Date(job.due_date).toLocaleDateString('en-US', { 
  weekday: 'long',
  month: 'long', 
  day: 'numeric', 
  year: 'numeric' 
})}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${approved 
  ? `Next Steps:\n• Your job is now queued for production\n• You'll receive updates as it progresses through our facility\n• Expected completion: ${new Date(job.due_date).toLocaleDateString('en-US')}` 
  : `Next Steps:\n• Review the feedback from our art department\n• Make necessary adjustments to your artwork\n• Resubmit for approval\n• We'll notify you once the revised artwork is approved`}

Questions? Reply to this email or contact us directly.

Best regards,
MINT PRINTS Team
  `.trim()

  const mailtoLink = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  
  window.open(mailtoLink, '_blank')
  
  return true
}

export function sendBulkArtworkApprovalEmail(
  job: Job,
  itemId: string,
  approvedArtwork: LegacyArtworkFile[]
): boolean {
  const item = job.line_items.find(i => i.id === itemId)
  
  if (!item || approvedArtwork.length === 0) return false
  
  const customerEmail = job.customer.email
  const subject = `✅ All Artwork Approved - ${job.job_number}${job.nickname ? ` - ${job.nickname}` : ''}`
  
  const locationsList = approvedArtwork.map(a => `• ${a.location}: ${a.fileName}`).join('\n')
  
  const body = `
Hello ${job.customer.name},

Great news! All artwork for your order has been approved and we're ready to begin production.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Job Number: ${job.job_number}
${job.nickname ? `Project Name: ${job.nickname}\n` : ''}
Product: ${item.product_name}${item.product_color ? ` (${item.product_color})` : ''}
Quantity: ${item.quantity} pieces

Approved Artwork (${approvedArtwork.length} file${approvedArtwork.length > 1 ? 's' : ''}):
${locationsList}

Due Date: ${new Date(job.due_date).toLocaleDateString('en-US', { 
  weekday: 'long',
  month: 'long', 
  day: 'numeric', 
  year: 'numeric' 
})}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
✅ Artwork approved - Production ready
📅 Your job is scheduled for production
📦 You'll receive shipping updates as your order progresses
🚚 Expected delivery: ${new Date(job.due_date).toLocaleDateString('en-US')}

We'll keep you updated throughout the production process!

Best regards,
MINT PRINTS Team
  `.trim()

  const mailtoLink = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  
  window.open(mailtoLink, '_blank')
  
  return true
}

export function sendArtworkRejectionWithFeedbackEmail(
  job: Job,
  itemId: string,
  artwork: LegacyArtworkFile,
  feedbackMessage: string
): boolean {
  const item = job.line_items.find(i => i.id === itemId)
  
  if (!item) return false
  
  const customerEmail = job.customer.email
  const subject = `❌ Artwork Revision Needed - ${job.job_number}${job.nickname ? ` - ${job.nickname}` : ''}`
  
  const body = `
Hello ${job.customer.name},

We've reviewed your artwork and need some revisions before we can proceed with production.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Job Number: ${job.job_number}
${job.nickname ? `Project Name: ${job.nickname}\n` : ''}
Product: ${item.product_name}${item.product_color ? ` (${item.product_color})` : ''}
Location: ${artwork.location}
Artwork File: ${artwork.fileName}

Feedback from Art Department:
${feedbackMessage}

Due Date: ${new Date(job.due_date).toLocaleDateString('en-US', { 
  weekday: 'long',
  month: 'long', 
  day: 'numeric', 
  year: 'numeric' 
})}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
1. Review the feedback above
2. Make the necessary adjustments to your artwork
3. Resubmit the revised file
4. We'll review and approve within 24 hours

Need help with the changes? Just reply to this email and our art team will assist you.

Best regards,
MINT PRINTS Team
  `.trim()

  const mailtoLink = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  
  window.open(mailtoLink, '_blank')
  
  return true
}
