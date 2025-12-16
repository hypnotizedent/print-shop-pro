import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Paperclip, 
  X, 
  Image as ImageIcon, 
  Eye, 
  Copy, 
  FloppyDisk,
  Sparkle,
  Info
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { EmailTemplate, EmailAttachment } from '@/lib/types'

interface QuoteReminderTemplateProps {
  onSaveTemplate: (template: EmailTemplate) => void
  existingTemplate?: EmailTemplate
}

const DEFAULT_QUOTE_REMINDER_TEMPLATE = {
  subject: 'Friendly Reminder: Quote {{quote_number}} Awaiting Your Review',
  body: `Hi {{customer_name}},

I hope this message finds you well! I wanted to follow up on the quote we sent over for {{quote_nickname}}.

Quote Details:
• Quote Number: {{quote_number}}
• Total Amount: {{total_amount}}
• Valid Until: {{valid_until}}

We're excited to help bring your vision to life! If you have any questions about the quote or would like to discuss any modifications, please don't hesitate to reach out.

Looking forward to working with you!

Best regards,
MINT PRINTS Team`,
  defaultAttachment: {
    fileName: 'mint-prints-logo.png',
    description: 'Company logo attachment',
  }
}

const AVAILABLE_VARIABLES = [
  { key: '{{customer_name}}', label: 'Customer Name', example: 'John Smith' },
  { key: '{{customer_email}}', label: 'Customer Email', example: 'john@example.com' },
  { key: '{{customer_company}}', label: 'Customer Company', example: 'ACME Corp' },
  { key: '{{quote_number}}', label: 'Quote Number', example: 'Q-2025-0045' },
  { key: '{{quote_nickname}}', label: 'Quote Nickname', example: 'Summer Promo Tees' },
  { key: '{{total_amount}}', label: 'Total Amount', example: '$1,234.56' },
  { key: '{{due_date}}', label: 'Due Date', example: 'Jan 15, 2025' },
  { key: '{{valid_until}}', label: 'Valid Until Date', example: 'Jan 30, 2025' },
  { key: '{{days_since_sent}}', label: 'Days Since Sent', example: '3' },
]

export function QuoteReminderTemplate({ onSaveTemplate, existingTemplate }: QuoteReminderTemplateProps) {
  const [subject, setSubject] = useState(
    existingTemplate?.subject || DEFAULT_QUOTE_REMINDER_TEMPLATE.subject
  )
  const [body, setBody] = useState(
    existingTemplate?.body || DEFAULT_QUOTE_REMINDER_TEMPLATE.body
  )
  const [isActive, setIsActive] = useState(existingTemplate?.isActive ?? true)
  const [logoAttachment, setLogoAttachment] = useState<EmailAttachment | null>(
    existingTemplate?.attachments?.[0] || null
  )
  const [previewMode, setPreviewMode] = useState(false)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo file must be under 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const attachment: EmailAttachment = {
        id: `logo-${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        dataUrl,
      }
      setLogoAttachment(attachment)
      toast.success('Logo attached successfully')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoAttachment(null)
    toast.success('Logo attachment removed')
  }

  const insertVariable = (variable: string) => {
    setBody(prev => prev + variable)
    toast.success('Variable inserted', {
      description: 'Will be replaced with actual data when sent',
    })
  }

  const handleSave = () => {
    if (!subject.trim()) {
      toast.error('Subject is required')
      return
    }

    if (!body.trim()) {
      toast.error('Email body is required')
      return
    }

    const template: EmailTemplate = {
      id: existingTemplate?.id || `template-${Date.now()}`,
      name: 'Quote Reminder with Logo',
      description: 'Automated quote reminder email with company logo attachment',
      type: 'quote-reminder',
      subject,
      body,
      variables: AVAILABLE_VARIABLES.map(v => v.key),
      isActive,
      createdAt: existingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: logoAttachment ? [logoAttachment] : [],
    }

    onSaveTemplate(template)
    toast.success('Quote reminder template saved!', {
      description: 'Your changes have been saved successfully',
    })
  }

  const getPreviewText = (text: string) => {
    return text
      .replace(/\{\{customer_name\}\}/g, 'John Smith')
      .replace(/\{\{customer_email\}\}/g, 'john@example.com')
      .replace(/\{\{customer_company\}\}/g, 'ACME Corporation')
      .replace(/\{\{quote_number\}\}/g, 'Q-2025-0045')
      .replace(/\{\{quote_nickname\}\}/g, 'Summer Promo T-Shirts')
      .replace(/\{\{total_amount\}\}/g, '$2,340.00')
      .replace(/\{\{due_date\}\}/g, 'January 15, 2025')
      .replace(/\{\{valid_until\}\}/g, 'January 30, 2025')
      .replace(/\{\{days_since_sent\}\}/g, '3')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkle className="text-primary" size={24} weight="fill" />
                Quote Reminder Email Template
              </CardTitle>
              <CardDescription className="mt-2">
                Customize the automated email sent to customers when following up on pending quotes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="template-active" className="text-sm">Active</Label>
              <Switch
                id="template-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info size={16} />
            <AlertDescription>
              Use variables like <code className="bg-muted px-1 py-0.5 rounded">{'{{customer_name}}'}</code> to personalize emails. 
              They'll be automatically replaced with real data when sent.
            </AlertDescription>
          </Alert>

          <Tabs value={previewMode ? 'preview' : 'edit'} onValueChange={(v) => setPreviewMode(v === 'preview')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit Template</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye size={16} className="mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter email body..."
                  rows={16}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-3">
                <Label>Quick Insert Variables</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AVAILABLE_VARIABLES.map((variable) => (
                    <Button
                      key={variable.key}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable.key)}
                      className="justify-start text-xs"
                    >
                      <Copy size={14} className="mr-1.5" />
                      {variable.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Company Logo Attachment</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Optional logo to include with every quote reminder
                    </p>
                  </div>
                </div>

                {logoAttachment ? (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="flex items-start gap-4">
                      {logoAttachment.dataUrl && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden border bg-background flex-shrink-0">
                          <img
                            src={logoAttachment.dataUrl}
                            alt={logoAttachment.fileName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm truncate">{logoAttachment.fileName}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(logoAttachment.fileSize / 1024).toFixed(1)} KB • {logoAttachment.mimeType}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveLogo}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <ImageIcon size={24} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Upload Logo</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            PNG, JPG, or SVG • Max 5MB
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6 mt-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Subject:</span>
                    </div>
                    <p className="font-semibold text-sm">{getPreviewText(subject)}</p>
                  </div>
                </div>
                <div className="p-6 bg-background">
                  <div className="max-w-2xl mx-auto space-y-4">
                    {logoAttachment && logoAttachment.dataUrl && (
                      <div className="flex justify-center pb-4 border-b">
                        <img
                          src={logoAttachment.dataUrl}
                          alt="Company Logo"
                          className="h-16 object-contain"
                        />
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {getPreviewText(body)}
                    </div>
                    {logoAttachment && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Paperclip size={14} />
                          <span>Attachment: {logoAttachment.fileName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Alert>
                <Info size={16} />
                <AlertDescription>
                  This preview shows sample data. Actual emails will use real customer and quote information.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {logoAttachment && (
                <Badge variant="secondary" className="gap-1">
                  <Paperclip size={14} />
                  Logo attached
                </Badge>
              )}
            </div>
            <Button onClick={handleSave} size="lg">
              <FloppyDisk size={18} className="mr-2" />
              Save Template
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Variables Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {AVAILABLE_VARIABLES.map((variable) => (
              <div key={variable.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {variable.key}
                  </code>
                  <span className="ml-3 text-sm text-muted-foreground">{variable.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{variable.example}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
