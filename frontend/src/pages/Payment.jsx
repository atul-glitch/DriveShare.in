import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { paymentAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useRazorpay } from '../hooks/userRazorpay'
import { Spinner, StatusBadge, EmptyState } from '../components/common'
import { CreditCard, BadgeInfo, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PaymentPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { pay } = useRazorpay()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshPayment = useCallback(async () => {
    const { data } = await paymentAPI.getByBooking(id)
    setPayment(data.data)
    return data.data
  }, [id])

  useEffect(() => {
    const load = async () => {
      try {
        await refreshPayment()
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load payment')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [refreshPayment])

  if (loading) {
    return <div className="flex justify-center pt-20"><Spinner /></div>
  }

  if (!payment) {
    return (
      <div className="space-y-4">
        <Link to={`/bookings/${id}`} className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--accent)' }}>
          <ArrowLeft size={14} /> Back to booking
        </Link>
        <EmptyState
          icon={CreditCard}
          title="Payment not ready"
          description="A payment record will appear here after the return flow creates it."
        />
      </div>
    )
  }

  const canPay = payment.status === 'pending' && (
    payment.paidBy?._id === user?._id || payment.paidBy === user?._id
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-sm mb-1" style={{ color: 'var(--text-dim)' }}>Payment</p>
        <h1 className="font-display text-2xl font-bold">Booking #{id.slice(-8).toUpperCase()}</h1>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Current status</p>
            <StatusBadge status={payment.status} />
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Total amount</p>
            <p className="font-display text-3xl font-bold" style={{ color: 'var(--accent)' }}>Rs.{payment.totalAmount}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <Row label={`Rs.${payment.ratePerHour}/hr x ${payment.hoursUsed?.toFixed(1)}h`} value={`Rs.${payment.baseFare}`} />
          {payment.insuranceFee > 0 && <Row label="Insurance" value={`Rs.${payment.insuranceFee}`} />}
          {payment.damageFee > 0 && <Row label="Damage fee" value={`Rs.${payment.damageFee}`} />}
          <div className="flex justify-between pt-2 font-bold" style={{ borderTop: '1px solid var(--border)' }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent)' }}>Rs.{payment.totalAmount}</span>
          </div>
        </div>

        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'var(--surface2)' }}>
          <BadgeInfo size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
          <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
            This page now launches Razorpay checkout for the renter. The owner can still review the payment status and fare breakdown here.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link to={`/bookings/${id}`} className="btn btn-outline">Back to booking</Link>
          {canPay && (
            <button
              className="btn btn-primary"
              onClick={() => pay(id, refreshPayment)}
            >
              Checkout with Razorpay
            </button>
          )}
          {payment.status === 'pending' && !canPay && (
            <button className="btn btn-primary" disabled>
              Waiting for renter payment
            </button>
          )}
          {canPay && (
            <button
              className="btn btn-secondary"
              onClick={async () => {
                try {
                  await paymentAPI.mockVerify(id)
                  toast.success('Mock payment applied')
                  await refreshPayment()
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Mock payment failed')
                }
              }}
            >
              Mark as paid (dev)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span style={{ color: 'var(--text-mid)' }}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
