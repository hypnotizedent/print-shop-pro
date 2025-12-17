import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  ChatCircle, 
  ArrowRight,
  Warning,
  Upload,
  Eye,
  UserPlus
} from '@phosphor-icons/react'
import type { 
  CustomerArtworkFile, 
  ArtworkReviewStage, 
  ArtworkReviewer, 
  ArtworkReviewComment,
  ArtworkApproval 
} from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { generateId } from '@/lib/data'

interface ArtworkApprovalWorkflowProps {
  artwork: CustomerArtworkFile
  onUpdateArtwork: (artwork: CustomerArtworkFile) => void
  onSendNotification?: (reviewerEmail: string, stage: ArtworkReviewStage) => void
}

const stageLabels: Record<ArtworkReviewStage, string> = {
  'uploaded': 'Uploaded',
  'internal-review': 'Internal Review',
  'customer-review': 'Customer Review',
  'final-approval': 'Final Approval',
  'approved': 'Approved',
  'rejected': 'Rejected'
}

const stageColors: Record<ArtworkReviewStage, string> = {
  'uploaded': 'bg-muted text-muted-foreground',
  'internal-review': 'bg-chart-2/20 text-chart-2',
  'customer-review': 'bg-chart-4/20 text-chart-4',
  'final-approval': 'bg-chart-1/20 text-chart-1',
  'approved': 'bg-primary/20 text-primary',
  'rejected': 'bg-destructive/20 text-destructive'
}

const reviewStages: ArtworkReviewStage[] = [
  'uploaded',
  'internal-review',
  'customer-review',
  'final-approval',
  'approved'
]

export function ArtworkApprovalWorkflow({ artwork, onUpdateArtwork, onSendNotification }: ArtworkApprovalWorkflowProps) {
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [newReviewerName, setNewReviewerName] = useState('')
  const [newReviewerEmail, setNewReviewerEmail] = useState('')
  const [newReviewerRole, setNewReviewerRole] = useState<'internal' | 'customer' | 'manager'>('internal')

  const currentStage = artwork.reviewStage || 'uploaded'
  const currentStageIndex = reviewStages.indexOf(currentStage)
  const approvalHistory = artwork.approvalHistory || []
  const assignedReviewers = artwork.assignedReviewers || []

  const handleAdvanceStage = () => {
    if (currentStageIndex < reviewStages.length - 1) {
      const nextStage = reviewStages[currentStageIndex + 1]
      
      const updatedArtwork: CustomerArtworkFile = {
        ...artwork,
        reviewStage: nextStage,
        updatedAt: new Date().toISOString()
      }

      onUpdateArtwork(updatedArtwork)
      toast.success(`Artwork advanced to ${stageLabels[nextStage]}`)
    }
  }

  const handleReview = (action: 'approve' | 'reject') => {
    setReviewAction(action)
    setReviewComment('')
    setRejectionReason('')
    setShowReviewDialog(true)
  }

  const handleSubmitReview = async () => {
    if (!reviewAction) return

    const user = await window.spark.user()
    if (!user) return
    
    const timestamp = new Date().toISOString()

    const comment: ArtworkReviewComment = {
      id: generateId('comment'),
      reviewerId: user.id.toString(),
      reviewerName: user.login,
      comment: reviewAction === 'approve' ? reviewComment : rejectionReason,
      timestamp,
      stage: currentStage
    }

    const approval: ArtworkApproval = {
      stage: currentStage,
      ...(reviewAction === 'approve' ? {
        approvedBy: user.login,
        approvedAt: timestamp
      } : {
        rejectedBy: user.login,
        rejectedAt: timestamp,
        rejectionReason
      }),
      comments: [comment]
    }

    const updatedHistory = [...approvalHistory, approval]
    
    let nextStage: ArtworkReviewStage = currentStage
    
    if (reviewAction === 'approve') {
      if (currentStageIndex < reviewStages.length - 1) {
        nextStage = reviewStages[currentStageIndex + 1]
      }
    } else {
      nextStage = 'rejected'
    }

    const updatedArtwork: CustomerArtworkFile = {
      ...artwork,
      reviewStage: nextStage,
      approvalHistory: updatedHistory,
      updatedAt: timestamp,
      ...(nextStage === 'approved' ? {
        productionReady: true,
        productionReadyDate: timestamp,
        productionReadyBy: user.login
      } : {})
    }

    onUpdateArtwork(updatedArtwork)
    
    if (reviewAction === 'approve' && nextStage === 'approved') {
      toast.success('Artwork approved for production!', {
        description: 'Artwork is now marked as production-ready'
      })
    } else if (reviewAction === 'reject') {
      toast.warning('Artwork rejected', {
        description: 'Customer will be notified of the rejection'
      })
    } else {
      toast.success(`Review submitted - Advanced to ${stageLabels[nextStage]}`)
    }

    setShowReviewDialog(false)
    setReviewAction(null)
  }

  const handleAddReviewer = () => {
    if (!newReviewerName.trim()) {
      toast.error('Please enter a reviewer name')
      return
    }

    const newReviewer: ArtworkReviewer = {
      id: generateId('reviewer'),
      name: newReviewerName.trim(),
      email: newReviewerEmail.trim() || undefined,
      role: newReviewerRole
    }

    const updatedReviewers = [...assignedReviewers, newReviewer]
    
    const updatedArtwork: CustomerArtworkFile = {
      ...artwork,
      assignedReviewers: updatedReviewers,
      updatedAt: new Date().toISOString()
    }

    onUpdateArtwork(updatedArtwork)
    
    toast.success(`${newReviewerName} assigned as reviewer`)
    
    if (newReviewerEmail && onSendNotification) {
      onSendNotification(newReviewerEmail, currentStage)
    }

    setNewReviewerName('')
    setNewReviewerEmail('')
    setNewReviewerRole('internal')
    setShowAssignDialog(false)
  }

  const handleAddComment = async () => {
    if (!reviewComment.trim()) return

    const user = await window.spark.user()
    if (!user) return
    
    const comment: ArtworkReviewComment = {
      id: generateId('comment'),
      reviewerId: user.id.toString(),
      reviewerName: user.login,
      comment: reviewComment.trim(),
      timestamp: new Date().toISOString(),
      stage: currentStage
    }

    const existingApproval = approvalHistory.find(a => a.stage === currentStage)
    
    let updatedHistory: ArtworkApproval[]
    if (existingApproval) {
      updatedHistory = approvalHistory.map(a => 
        a.stage === currentStage 
          ? { ...a, comments: [...(a.comments || []), comment] }
          : a
      )
    } else {
      updatedHistory = [
        ...approvalHistory,
        {
          stage: currentStage,
          comments: [comment]
        }
      ]
    }

    const updatedArtwork: CustomerArtworkFile = {
      ...artwork,
      approvalHistory: updatedHistory,
      updatedAt: new Date().toISOString()
    }

    onUpdateArtwork(updatedArtwork)
    setReviewComment('')
    toast.success('Comment added')
  }

  const allComments = approvalHistory.flatMap(a => a.comments || []).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Approval Workflow</h3>
            <p className="text-sm text-muted-foreground">
              Track artwork through multi-step review process
            </p>
          </div>
          <Badge className={stageColors[currentStage]}>
            {stageLabels[currentStage]}
          </Badge>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            {reviewStages.slice(0, -1).map((stage, index) => {
              const isActive = index === currentStageIndex
              const isCompleted = index < currentStageIndex
              const isRejected = currentStage === 'rejected' && index <= currentStageIndex
              
              return (
                <div key={stage} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : isActive
                          ? 'bg-chart-1/20 text-chart-1 border-2 border-chart-1'
                          : isRejected
                          ? 'bg-destructive/20 text-destructive border-2 border-destructive'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={20} weight="fill" />
                      ) : isRejected ? (
                        <XCircle size={20} weight="fill" />
                      ) : isActive ? (
                        <Clock size={20} weight="fill" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center ${
                      isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}>
                      {stageLabels[stage]}
                    </span>
                  </div>
                  
                  {index < reviewStages.length - 2 && (
                    <div className={`h-0.5 flex-1 mx-2 ${
                      index < currentStageIndex ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {currentStage !== 'approved' && currentStage !== 'rejected' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleReview('approve')}
                className="flex-1"
              >
                <CheckCircle size={16} className="mr-2" />
                Approve Stage
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReview('reject')}
                className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <XCircle size={16} className="mr-2" />
                Reject Artwork
              </Button>
            </div>
          )}

          {currentStage === 'approved' && (
            <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <CheckCircle size={24} weight="fill" className="text-primary" />
              <div>
                <p className="font-medium text-sm">Production Ready</p>
                <p className="text-xs text-muted-foreground">
                  Approved {artwork.productionReadyDate && formatDistanceToNow(new Date(artwork.productionReadyDate), { addSuffix: true })} by {artwork.productionReadyBy}
                </p>
              </div>
            </div>
          )}

          {currentStage === 'rejected' && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <Warning size={24} weight="fill" className="text-destructive" />
              <div>
                <p className="font-medium text-sm">Artwork Rejected</p>
                <p className="text-xs text-muted-foreground">
                  Revision needed - check comments below
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <User size={16} />
            Assigned Reviewers
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAssignDialog(true)}
          >
            <UserPlus size={16} className="mr-2" />
            Add Reviewer
          </Button>
        </div>

        {assignedReviewers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No reviewers assigned yet
          </p>
        ) : (
          <div className="space-y-2">
            {assignedReviewers.map((reviewer) => (
              <div
                key={reviewer.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{reviewer.name}</p>
                    {reviewer.email && (
                      <p className="text-xs text-muted-foreground">{reviewer.email}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {reviewer.role}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <ChatCircle size={16} />
          Comments & Feedback
        </h3>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment or feedback..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddComment}
              disabled={!reviewComment.trim()}
            >
              Post
            </Button>
          </div>

          <Separator />

          <ScrollArea className="h-[300px]">
            {allComments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments yet
              </p>
            ) : (
              <div className="space-y-3 pr-4">
                {allComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 bg-muted/50 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                          <User size={12} />
                        </div>
                        <span className="text-sm font-medium">{comment.reviewerName}</span>
                        <Badge variant="outline" className={`text-xs ${stageColors[comment.stage]}`}>
                          {stageLabels[comment.stage]}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </Card>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Stage' : 'Reject Artwork'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? `Approve the current ${stageLabels[currentStage].toLowerCase()} stage and advance to the next step.`
                : 'Reject the artwork and provide feedback for revision.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {reviewAction === 'approve' ? (
              <div className="space-y-2">
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Add any notes about this approval..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="rejection">Rejection Reason *</Label>
                <Textarea
                  id="rejection"
                  placeholder="Explain what needs to be changed..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleSubmitReview}
              disabled={reviewAction === 'reject' && !rejectionReason.trim()}
            >
              {reviewAction === 'approve' ? (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Approve
                </>
              ) : (
                <>
                  <XCircle size={16} className="mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Reviewer</DialogTitle>
            <DialogDescription>
              Add a team member or stakeholder to review this artwork.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reviewer-name">Name *</Label>
              <Input
                id="reviewer-name"
                placeholder="Enter reviewer name"
                value={newReviewerName}
                onChange={(e) => setNewReviewerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewer-email">Email (Optional)</Label>
              <Input
                id="reviewer-email"
                type="email"
                placeholder="reviewer@example.com"
                value={newReviewerEmail}
                onChange={(e) => setNewReviewerEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Email notifications will be sent if provided
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewer-role">Role</Label>
              <Select value={newReviewerRole} onValueChange={(value: any) => setNewReviewerRole(value)}>
                <SelectTrigger id="reviewer-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal Team</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddReviewer}>
              <UserPlus size={16} className="mr-2" />
              Add Reviewer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
