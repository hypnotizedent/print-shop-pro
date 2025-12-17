import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, FileText, Trash, CheckCircle, XCircle } from '@phosphor-icons/react'
import type { TaxCertificate } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface TaxCertManagerProps {
  customerId: string
  certificates: TaxCertificate[]
  onSaveCertificate: (certificate: TaxCertificate) => void
  onDeleteCertificate: (certificateId: string) => void
  onUpdateCertificate: (certificate: TaxCertificate) => void
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export function TaxCertManager({
  customerId,
  certificates,
  onSaveCertificate,
  onDeleteCertificate,
  onUpdateCertificate,
}: TaxCertManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCert, setEditingCert] = useState<TaxCertificate | null>(null)
  const [certificateNumber, setCertificateNumber] = useState('')
  const [state, setState] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [issuedDate, setIssuedDate] = useState('')
  const [notes, setNotes] = useState('')

  const handleOpenDialog = (cert?: TaxCertificate) => {
    if (cert) {
      setEditingCert(cert)
      setCertificateNumber(cert.certificateNumber)
      setState(cert.state)
      setExpirationDate(cert.expirationDate)
      setIssuedDate(cert.issuedDate)
      setNotes(cert.notes || '')
    } else {
      setEditingCert(null)
      setCertificateNumber('')
      setState('')
      setExpirationDate('')
      setIssuedDate(new Date().toISOString().split('T')[0])
      setNotes('')
    }
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!certificateNumber || !state || !expirationDate || !issuedDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const certificate: TaxCertificate = {
      id: editingCert?.id || `tc-${Date.now()}`,
      customerId,
      certificateNumber,
      state,
      expirationDate,
      issuedDate,
      notes,
      isActive: true,
      createdAt: editingCert?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingCert) {
      onUpdateCertificate(certificate)
      toast.success('Tax certificate updated')
    } else {
      onSaveCertificate(certificate)
      toast.success('Tax certificate added')
    }

    setDialogOpen(false)
  }

  const handleDelete = (certId: string) => {
    if (confirm('Are you sure you want to delete this tax certificate?')) {
      onDeleteCertificate(certId)
      toast.success('Tax certificate deleted')
    }
  }

  const handleToggleActive = (cert: TaxCertificate) => {
    onUpdateCertificate({
      ...cert,
      isActive: !cert.isActive,
      updatedAt: new Date().toISOString(),
    })
    toast.success(cert.isActive ? 'Certificate deactivated' : 'Certificate activated')
  }

  const isExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date()
  }

  const isExpiringSoon = (expirationDate: string) => {
    const expDate = new Date(expirationDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expDate < thirtyDaysFromNow && expDate >= new Date()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
          Tax Exemption Certificates
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus size={16} className="mr-2" />
              Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCert ? 'Edit Tax Certificate' : 'Add Tax Certificate'}
              </DialogTitle>
              <DialogDescription>
                Enter the tax exemption certificate details for this customer.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="cert-number">Certificate Number *</Label>
                <Input
                  id="cert-number"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  placeholder="e.g., TX-123456789"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issued-date">Issued Date *</Label>
                  <Input
                    id="issued-date"
                    type="date"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="expiration-date">Expiration Date *</Label>
                  <Input
                    id="expiration-date"
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingCert ? 'Update' : 'Add'} Certificate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {certificates.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <FileText size={48} className="mx-auto mb-3 opacity-30" />
            <p>No tax exemption certificates on file</p>
            <p className="text-sm mt-1">Add a certificate to enable tax-exempt pricing</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => {
            const expired = isExpired(cert.expirationDate)
            const expiringSoon = isExpiringSoon(cert.expirationDate)

            return (
              <Card key={cert.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={20} className="text-primary" />
                      <span className="font-semibold">{cert.certificateNumber}</span>
                      <Badge variant="outline" className="text-xs">
                        {cert.state}
                      </Badge>
                      {cert.isActive && !expired ? (
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                          <CheckCircle size={14} className="mr-1" />
                          Active
                        </Badge>
                      ) : expired ? (
                        <Badge variant="destructive">
                          <XCircle size={14} className="mr-1" />
                          Expired
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Inactive
                        </Badge>
                      )}
                      {expiringSoon && !expired && (
                        <Badge className="bg-yellow-500/10 text-yellow-500">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                      </div>
                      <div>
                        Expires: {new Date(cert.expirationDate).toLocaleDateString()}
                        {!expired && (
                          <span className="ml-2">
                            ({formatDistanceToNow(new Date(cert.expirationDate), { addSuffix: true })})
                          </span>
                        )}
                      </div>
                      {cert.notes && (
                        <div className="mt-2">
                          <span className="font-medium">Notes:</span> {cert.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(cert)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={cert.isActive ? 'outline' : 'default'}
                      onClick={() => handleToggleActive(cert)}
                    >
                      {cert.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(cert.id)}
                    >
                      <Trash size={16} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
