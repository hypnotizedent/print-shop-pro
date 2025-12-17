import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Check, 
  X, 
  Clock, 
  ChatCircleDots, 
  Warning,
  CheckCircle,
  XCircle,
  Eye,
  Lightbulb,
  Pencil,
  Image as ImageIcon
} from '@phosphor-icons/react'
import type { LegacyArtworkFile, Job } from '@/lib/types'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface ArtworkReview {
  artworkLocation: string
  itemId: string
  itemName: string
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision'
  reviewedBy?: string
  reviewedAt?: string
  comments?: string
  revisionNotes?: string
}

interface JobArtworkReviewProps {
  job: Job
  onApproveArtwork: (itemId: string, location: string, approved: boolean) => void
  onRequestRevision?: (itemId: string, location: string, notes: string) => void
}

export function JobArtworkReview({ 
  job, 
  onApproveArtwork,
  onRequestRevision 
}: JobArtworkReviewProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<{
    itemId: string
    location: string
    artwork: LegacyArtworkFile
  } | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [revisionNotes, setRevisionNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const allArtworkReviews: ArtworkReview[] = job.line_items.flatMap(item => 
    (item.artwork || []).map(art => ({
      artworkLocation: art.location,
      itemId: item.id,
      itemName: item.product_name,
      status: art.approved ? 'approved' : 'pending',
      reviewedAt: art.uploadedAt,
    }))
  )

  const filteredReviews = allArtworkReviews.filter(review => {
    if (activeTab === 'all') return true
    return review.status === activeTab
  })

  const pendingCount = allArtworkReviews.filter(r => r.status === 'pending').length
  const approvedCount = allArtworkReviews.filter(r => r.status === 'approved').length
  const rejectedCount = allArtworkReviews.filter(r => r.status === 'rejected').length

  const handleQuickApprove = (itemId: string, location: string) => {
    onApproveArtwork(itemId, location, true)
    toast.success('Artwork approved', {
      description: `${location} approved for production`,
    })
  }

  const handleQuickReject = (itemId: string, location: string) => {
    onApproveArtwork(itemId, location, false)
    toast.warning('Artwork rejected', {
      description: `${location} needs revision`,
    })
  }

  const handleDetailedReview = (itemId: string, location: string, artwork: LegacyArtworkFile) => {
    setSelectedArtwork({ itemId, location, artwork })
    setReviewComment('')
    setRevisionNotes('')
  }

  const handleSubmitReview = (approved: boolean) => {
    if (!selectedArtwork) return

    onApproveArtwork(selectedArtwork.itemId, selectedArtwork.location, approved)
    
    if (!approved && revisionNotes && onRequestRevision) {
      onRequestRevision(selectedArtwork.itemId, selectedArtwork.location, revisionNotes)
    }

    toast.success(
      approved ? 'Artwork approved' : 'Revision requested',
      {
        description: approved 
          ? `${selectedArtwork.location} ready for production`
          : `Customer will be notified of required changes`,
        duration: 4000,
      }
    )

    setSelectedArtwork(null)
    setReviewComment('')
    setRevisionNotes('')
  }

  const handleBulkApprove = () => {
    const pendingItems = allArtworkReviews.filter(r => r.status === 'pending')
    
    if (pendingItems.length === 0) {
      toast.info('No pending artwork to approve')
      return
    }

    pendingItems.forEach(review => {
      onApproveArtwork(review.itemId, review.artworkLocation, true)
    })

    toast.success('Bulk approval complete', {
      description: `${pendingItems.length} artwork file${pendingItems.length > 1 ? 's' : ''} approved`,
      duration: 5000,
    })
  }

  if (allArtworkReviews.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ImageIcon size={48} className="mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold mb-2">No Artwork Files</h3>
        <p className="text-sm text-muted-foreground">
          Upload artwork files to begin the approval workflow
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Artwork Approval Workflow</h3>
            <p className="text-sm text-muted-foreground">
              Review and approve artwork for production
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Button 
                onClick={handleBulkApprove}
                size="sm"
                variant="default"
              >
                <CheckCircle size={16} className="mr-2" />
                Approve All Pending ({pendingCount})
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3 bg-yellow-500/10 border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
                <div className="text-xs text-muted-foreground">Pending Review</div>
              </div>
              <Clock size={24} className="text-yellow-400" />
            </div>
          </Card>
          
          <Card className="p-3 bg-emerald-500/10 border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{approvedCount}</div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
          </Card>
          
          <Card className="p-3 bg-red-500/10 border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-400">{rejectedCount}</div>
                <div className="text-xs text-muted-foreground">Needs Revision</div>
              </div>
              <XCircle size={24} className="text-red-400" />
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">
              All ({allArtworkReviews.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No artwork in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredReviews.map((review) => {
                  const item = job.line_items.find(i => i.id === review.itemId)
                  const artwork = item?.artwork?.find(a => a.location === review.artworkLocation)
                  
                  if (!artwork || !item) return null

                  return (
                    <Card key={`${review.itemId}-${review.artworkLocation}`} className="relative group">
                      <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
                        <img 
                          src={artwork.dataUrl} 
                          alt={`${review.itemName} - ${review.artworkLocation}`}
                          className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => handleDetailedReview(review.itemId, review.artworkLocation, artwork)}
                        />
                        
                        <div className="absolute top-2 left-2">
                          {review.status === 'approved' && (
                            <Badge className="bg-emerald-500 text-white">
                              <Check size={12} className="mr-1" />
                              Approved
                            </Badge>
                          )}
                          {review.status === 'pending' && (
                            <Badge className="bg-yellow-500 text-white">
                              <Clock size={12} className="mr-1" />
                              Pending
                            </Badge>
                          )}
                          {review.status === 'rejected' && (
                            <Badge className="bg-red-500 text-white">
                              <X size={12} className="mr-1" />
                              Rejected
                            </Badge>
                          )}
                        </div>

                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDetailedReview(review.itemId, review.artworkLocation, artwork)}
                        >
                          <Eye size={16} />
                        </Button>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-8"
                              onClick={() => handleQuickApprove(review.itemId, review.artworkLocation)}
                              disabled={review.status === 'approved'}
                            >
                              <Check size={14} className="mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1 h-8"
                              onClick={() => handleQuickReject(review.itemId, review.artworkLocation)}
                              disabled={review.status === 'rejected'}
                            >
                              <X size={14} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <div className="text-xs font-medium truncate mb-0.5" title={review.itemName}>
                          {review.itemName}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {review.artworkLocation.replace('-', ' ')}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={!!selectedArtwork} onOpenChange={(open) => !open && setSelectedArtwork(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Artwork Review</DialogTitle>
            <DialogDescription>
              Review artwork and provide feedback for production
            </DialogDescription>
          </DialogHeader>

          {selectedArtwork && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
                  <img 
                    src={selectedArtwork.artwork.dataUrl} 
                    alt={selectedArtwork.location}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium capitalize">{selectedArtwork.location.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">File:</span>
                    <span className="font-medium truncate max-w-[200px]" title={selectedArtwork.artwork.fileName}>
                      {selectedArtwork.artwork.fileName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Uploaded:</span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(selectedArtwork.artwork.uploadedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {selectedArtwork.artwork.approved ? (
                      <Badge className="bg-emerald-500">
                        <Check size={12} className="mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500">
                        <Clock size={12} className="mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb size={16} />
                    Review Checklist
                  </h4>
                  <Card className="p-3 bg-secondary/50">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>Verify artwork resolution meets print requirements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>Check color accuracy and contrast</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>Confirm placement matches mockup</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>Review for spelling or design errors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>Verify file format is production-ready</span>
                      </li>
                    </ul>
                  </Card>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                    <ChatCircleDots size={16} />
                    Internal Notes (Optional)
                  </label>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Add any internal notes about this artwork..."
                    className="min-h-[80px]"
                  />
                </div>

                {!selectedArtwork.artwork.approved && (
                  <div>
                    <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                      <Pencil size={16} />
                      Revision Notes for Customer
                    </label>
                    <Textarea
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      placeholder="If rejecting, explain what needs to be changed..."
                      className="min-h-[100px]"
                    />
                    {revisionNotes.length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs flex items-start gap-2">
                        <Warning size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span className="text-yellow-500">
                          Customer will receive an email with these revision notes
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedArtwork(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleSubmitReview(false)}
                  >
                    <X size={16} className="mr-2" />
                    Request Revision
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => handleSubmitReview(true)}
                  >
                    <Check size={16} className="mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
