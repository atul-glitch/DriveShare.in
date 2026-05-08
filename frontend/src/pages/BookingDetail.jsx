import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookingAPI, paymentAPI, reviewAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { StatusBadge, Spinner, Avatar, StarRating, ConfirmModal } from '../components/common'
import MessageThread from '../components/message/MessageThread'
import { Calendar, Clock, MapPin, Shield, CheckCircle2, Truck, RotateCcw, XCircle, MessageSquare, Star } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function BookingDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user, isOwner } = useAuth()
  const [booking, setBooking]   = useState(null)
  const [payment, setPayment]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [tab,     setTab]       = useState('details')
  const [modal,   setModal]     = useState(null) // { type, data }
  const [actBusy, setActBusy]   = useState(false)

  // review form
  const [rv, setRv] = useState({ vehicleRating:5, ownerRating:5, overallRating:5, comment:'' })
  const [damageFee, setDamageFee] = useState(0)

  const refresh = async () => {
    try {
      const { data } = await bookingAPI.getById(id)
      setBooking(data.data)
      if (data.data.payment) {
        const pr = await paymentAPI.getByBooking(id)
        setPayment(pr.data.data)
      }
    } catch { toast.error('Failed to load booking') }
    finally  { setLoading(false) }
  }

  useEffect(() => { refresh() }, [id])

  const act = async (fn, successMsg) => {
    setActBusy(true)
    try { await fn(); toast.success(successMsg); await refresh() }
    catch (e) { toast.error(e.response?.data?.message || 'Action failed') }
    finally { setActBusy(false); setModal(null) }
  }

  const handleInitiatePayment = () => {
    navigate(`/payments/${id}`)
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner /></div>
  if (!booking) return <div className="text-center py-20">Booking not found.</div>

  const { vehicle, renter, owner, status, scheduledPickupAt, scheduledReturnAt,
    ratePerHour, estimatedHours, insuranceOpted, pickupLocation } = booking

  const estimatedTotal = (ratePerHour * (estimatedHours || 0)).toFixed(0)
  const isRenterUser   = renter?._id === user?._id || renter === user?._id
  const isOwnerUser    = owner?._id  === user?._id || owner  === user?._id

  const ACTIONS = [
    { show: isOwnerUser && status === 'pending',    label: 'Confirm Booking',   icon: CheckCircle2, cls: 'btn-primary', fn: () => act(() => bookingAPI.confirm(id), 'Booking confirmed!') },
    { show: isOwnerUser && status === 'confirmed',  label: 'Mark Pickup',       icon: Truck,        cls: 'btn-primary', fn: () => act(() => bookingAPI.markPickup(id), 'Pickup marked!') },
    { show: isOwnerUser && status === 'active',     label: 'Mark Returned',     icon: RotateCcw,    cls: 'btn-outline', fn: () => setModal({ type: 'return' }) },
    { show: (isRenterUser||isOwnerUser) && ['pending','confirmed'].includes(status),
      label: 'Cancel Booking', icon: XCircle, cls: 'btn-danger', fn: () => setModal({ type: 'cancel' }) },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-dim)' }}>Booking #{id.slice(-8).toUpperCase()}</p>
          <h1 className="font-display text-2xl font-bold">
            {vehicle?.make} {vehicle?.model}
          </h1>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {['details','messages','payment'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab===t ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent'}`}
            style={tab !== t ? { color: 'var(--text-mid)' } : {}}>
            {t === 'messages' ? <span className="flex items-center gap-1.5"><MessageSquare size={14}/>{t}</span> : t}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {tab === 'details' && (
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Info card */}
          <div className="card p-5 space-y-4">
            <h3 className="font-display font-semibold">Trip Details</h3>
            <InfoRow icon={Calendar} label="Pickup"  value={format(new Date(scheduledPickupAt), 'dd MMM yyyy, hh:mm a')} />
            <InfoRow icon={Calendar} label="Return"  value={format(new Date(scheduledReturnAt), 'dd MMM yyyy, hh:mm a')} />
            <InfoRow icon={Clock}    label="Duration" value={`${estimatedHours?.toFixed(1) || '—'} hours`} />
            <InfoRow icon={MapPin}   label="Pickup City" value={pickupLocation?.address?.city || '—'} />
            {insuranceOpted && <InfoRow icon={Shield} label="Insurance" value="Opted in" />}
            <div className="flex justify-between pt-3 font-bold" style={{ borderTop: '1px solid var(--border)' }}>
              <span>Estimated Fare</span>
              <span style={{ color: 'var(--accent)' }}>₹{estimatedTotal}</span>
            </div>
          </div>

          {/* Parties */}
          <div className="card p-5 space-y-4">
            <h3 className="font-display font-semibold">Parties</h3>
            <PartyRow label="Renter" user={renter} />
            <PartyRow label="Owner"  user={owner} />
          </div>

          {/* Actions */}
          {ACTIONS.filter(a => a.show).length > 0 && (
            <div className="sm:col-span-2 card p-5">
              <h3 className="font-display font-semibold mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                {ACTIONS.filter(a => a.show).map(a => (
                  <button key={a.label} onClick={a.fn} disabled={actBusy}
                    className={`btn ${a.cls} gap-2`}>
                    <a.icon size={15} /> {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Leave Review (renter, completed) */}
          {isRenterUser && status === 'completed' && !payment?.reviewed && (
            <div className="sm:col-span-2 card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} style={{ color: 'var(--accent)' }} />
                <h3 className="font-display font-semibold">Leave a Review</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                {[['vehicleRating','Vehicle'],['ownerRating','Owner'],['overallRating','Overall']].map(([k,l]) => (
                  <div key={k}>
                    <label className="label">{l}</label>
                    <StarRating value={rv[k]} interactive onChange={v => setRv(p => ({...p,[k]:v}))} />
                  </div>
                ))}
              </div>
              <textarea className="input mb-3" rows={3} placeholder="Share your experience…"
                value={rv.comment} onChange={e => setRv(p=>({...p,comment:e.target.value}))} />
              <button onClick={() => act(
                () => reviewAPI.create({ bookingId: id, ...rv }),
                'Review submitted!'
              )} disabled={actBusy} className="btn btn-primary">Submit Review</button>
            </div>
          )}
        </div>
      )}

      {/* Messages tab */}
      {tab === 'messages' && (
        <div className="card overflow-hidden">
          <MessageThread bookingId={id} />
        </div>
      )}

      {/* Payment tab */}
      {tab === 'payment' && (
        <div className="card p-5 space-y-4">
          <h3 className="font-display font-semibold">Payment Summary</h3>
          {payment ? (
            <>
              <div className="space-y-2 text-sm">
                <FareRow label={`₹${payment.ratePerHour}/hr × ${payment.hoursUsed?.toFixed(1)}h`} value={`₹${payment.baseFare}`} />
                {payment.insuranceFee > 0 && <FareRow label="Insurance" value={`₹${payment.insuranceFee}`} />}
                {payment.damageFee > 0    && <FareRow label="Damage fee" value={`₹${payment.damageFee}`} danger />}
                <div className="flex justify-between font-bold text-base pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <span>Total</span><span style={{ color: 'var(--accent)' }}>₹{payment.totalAmount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge status={payment.status} />
                {payment.status === 'pending' && isRenterUser && (
                  <button onClick={handleInitiatePayment} disabled={actBusy}
                    className="btn btn-primary btn-sm">Open Checkout</button>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-mid)' }}>Payment record will be created after vehicle return.</p>
          )}
        </div>
      )}

      {/* Modals */}
      <ConfirmModal open={modal?.type === 'cancel'} title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This cannot be undone."
        confirmLabel="Cancel Booking" danger
        onConfirm={() => act(() => bookingAPI.cancel(id, { reason: 'User cancelled' }), 'Booking cancelled')}
        onCancel={() => setModal(null)} />

      {modal?.type === 'return' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative card p-6 w-full max-w-sm animate-fade-up">
            <h3 className="font-display font-semibold mb-4">Mark Vehicle Returned</h3>
            <div className="mb-4">
              <label className="label">Damage Fee (₹) — if any</label>
              <input type="number" className="input" value={damageFee} onChange={e => setDamageFee(Number(e.target.value))} min={0} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={() => act(() => bookingAPI.markReturn(id, { damageFee }), 'Vehicle returned!')} disabled={actBusy}
                className="btn btn-primary flex-1">{actBusy ? <Spinner size="sm" /> : 'Confirm Return'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
      <div className="flex-1 flex justify-between gap-2">
        <span style={{ color: 'var(--text-mid)' }}>{label}</span>
        <span className="font-medium text-right">{value}</span>
      </div>
    </div>
  )
}

function PartyRow({ label, user: u }) {
  if (!u) return null
  return (
    <div className="flex items-center gap-3">
      <Avatar src={u.avatar} name={u.fullName} size={38} />
      <div>
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{label}</p>
        <p className="text-sm font-semibold">{u.fullName}</p>
        {u.isVerified && <span className="badge badge-green text-xs">Verified</span>}
      </div>
    </div>
  )
}

function FareRow({ label, value, danger }) {
  return (
    <div className="flex justify-between" style={{ color: danger ? '#ef4444' : 'var(--text-mid)' }}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}
