import { useState } from 'react'
import { reviewAPI } from '../../services/api'
import { StarRating, Spinner, FormField } from '../common'
import { Star, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReviewForm({ bookingId, onSuccess }) {
  const [ratings, setRatings] = useState({ vehicleRating: 5, ownerRating: 5, overallRating: 5 })
  const [comment, setComment] = useState('')
  const [images,  setImages]  = useState([])
  const [previews,setPreviews]= useState([])
  const [loading, setLoading] = useState(false)

  const setRating = (key, val) => setRatings(p => ({ ...p, [key]: val }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const submit = async () => {
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('bookingId', bookingId)
      Object.entries(ratings).forEach(([k, v]) => fd.append(k, v))
      fd.append('comment', comment)
      images.forEach(img => fd.append('images', img))
      await reviewAPI.create(fd)
      toast.success('Review submitted!')
      onSuccess?.()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  const ratingFields = [
    { key: 'vehicleRating', label: 'Vehicle Condition' },
    { key: 'ownerRating',   label: 'Owner Experience' },
    { key: 'overallRating', label: 'Overall Rating'   },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Star size={18} style={{ color: 'var(--accent)' }} />
        <h3 className="font-display font-semibold text-lg">Leave a Review</h3>
      </div>

      {/* Rating rows */}
      <div className="space-y-3">
        {ratingFields.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm" style={{ color: 'var(--text-mid)' }}>{label}</label>
            <div className="flex items-center gap-3">
              <StarRating value={ratings[key]} interactive onChange={v => setRating(key, v)} size={22} />
              <span className="text-sm font-mono w-4 text-right" style={{ color: 'var(--accent)' }}>{ratings[key]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Comment */}
      <FormField label="Comment (optional)">
        <textarea className="input resize-none" rows={4}
          placeholder="Share your experience with this vehicle and owner…"
          value={comment} onChange={e => setComment(e.target.value)}
          maxLength={1000} />
        <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-dim)' }}>{comment.length}/1000</p>
      </FormField>

      {/* Image upload */}
      <FormField label="Photos (optional, up to 5)">
        <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
          style={{ border: '1px dashed var(--border-light)', background: 'var(--surface2)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}>
          <Upload size={16} style={{ color: 'var(--text-dim)' }} />
          <span className="text-sm" style={{ color: 'var(--text-mid)' }}>
            {images.length > 0 ? `${images.length} photo(s) selected` : 'Upload photos'}
          </span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
        </label>
        {previews.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {previews.map((p, i) => (
              <img key={i} src={p} alt="" className="w-16 h-12 object-cover rounded-lg" />
            ))}
          </div>
        )}
      </FormField>

      <button onClick={submit} disabled={loading} className="btn btn-primary w-full">
        {loading ? <><Spinner size="sm" /> Submitting…</> : 'Submit Review'}
      </button>
    </div>
  )
}
