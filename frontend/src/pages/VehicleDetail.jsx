import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { vehicleAPI, bookingAPI, reviewAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { StatusBadge, StarRating, Spinner, Avatar } from '../components/common'
import { MapPin, Fuel, Users, Gauge, Zap, Settings2, Wind, Bluetooth, Navigation2, Baby, Shield, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, addHours } from 'date-fns'
import toast from 'react-hot-toast'

export default function VehicleDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [vehicle,  setVehicle]  = useState(null)
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [imgIdx,   setImgIdx]   = useState(0)
  const [booking,  setBooking]  = useState(false)

  // Booking form state
  const [pickupAt,  setPickupAt]  = useState('')
  const [returnAt,  setReturnAt]  = useState('')
  const [insurance, setInsurance] = useState(false)
  const [city,      setCity]      = useState('')

  useEffect(() => {
    Promise.all([
      vehicleAPI.getById(id),
      reviewAPI.getVehicleReviews(id, { limit: 5 })
    ]).then(([vRes, rRes]) => {
      setVehicle(vRes.data.data)
      setReviews(rRes.data.data.reviews)
    }).catch(() => toast.error('Failed to load vehicle'))
      .finally(() => setLoading(false))
  }, [id])

  const hours = pickupAt && returnAt
    ? Math.max(0, (new Date(returnAt) - new Date(pickupAt)) / 3_600_000).toFixed(1)
    : 0

  const baseFare    = vehicle ? Number(hours) * vehicle.ratePerHour : 0
  const insFee      = insurance && vehicle?.insuranceAvailable ? Number(hours) * vehicle.insuranceFeePerHour : 0
  const totalFare   = baseFare + insFee

  const handleBook = async () => {
    if (!user) { toast.error('Please login to book'); navigate('/login'); return }
    if (!pickupAt || !returnAt) { toast.error('Select pickup and return time'); return }
    if (!city) { toast.error('Enter pickup city'); return }
    setBooking(true)
    try {
      const { data } = await bookingAPI.create({
        vehicleId: id,
        scheduledPickupAt: pickupAt,
        scheduledReturnAt: returnAt,
        insuranceOpted: insurance,
        pickupLng: vehicle.currentLocation.coordinates[0],
        pickupLat: vehicle.currentLocation.coordinates[1],
        pickupCity: city,
      })
      toast.success('Booking request sent to owner!')
      navigate(`/bookings/${data.data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>
  if (!vehicle) return <div className="text-center py-20">Vehicle not found.</div>

  const imgs = vehicle.images?.length ? vehicle.images : [null]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid lg:grid-cols-3 gap-8">

        {/* ── Left: Details ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Image gallery */}
          <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--surface2)', height: 380 }}>
            {imgs[imgIdx]
              ? <img src={imgs[imgIdx]} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-7xl">🚗</div>
            }
            {imgs.length > 1 && <>
              <button onClick={() => setImgIdx(p => (p - 1 + imgs.length) % imgs.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 btn btn-ghost p-2 rounded-full"
                style={{ background: 'rgba(0,0,0,0.6)' }}><ChevronLeft size={20} /></button>
              <button onClick={() => setImgIdx(p => (p + 1) % imgs.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost p-2 rounded-full"
                style={{ background: 'rgba(0,0,0,0.6)' }}><ChevronRight size={20} /></button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {imgs.map((_, i) => <span key={i} onClick={() => setImgIdx(i)} className="w-2 h-2 rounded-full cursor-pointer transition-colors"
                  style={{ background: i === imgIdx ? 'var(--accent)' : 'rgba(255,255,255,0.4)' }} />)}
              </div>
            </>}
          </div>

          {/* Title + rating */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">{vehicle.make} {vehicle.model} <span style={{ color: 'var(--text-dim)' }}>{vehicle.year}</span></h1>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={vehicle.status} />
                <span className="badge badge-gray capitalize">{vehicle.category}</span>
                {vehicle.totalReviews > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarRating value={Math.round(vehicle.averageRating)} size={14} />
                    <span className="text-sm font-medium">{vehicle.averageRating?.toFixed(1)}</span>
                    <span className="text-sm" style={{ color: 'var(--text-dim)' }}>({vehicle.totalReviews})</span>
                  </div>
                )}
              </div>
            </div>
            {vehicle.currentLocation?.address?.city && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-mid)' }}>
                <MapPin size={14} />{vehicle.currentLocation.address.city}, {vehicle.currentLocation.address.state}
              </div>
            )}
          </div>

          {/* Specs grid */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-base mb-4">Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Spec icon={Fuel}      label="Fuel"         value={vehicle.fuelType} />
              <Spec icon={Users}     label="Seats"        value={`${vehicle.seats} seats`} />
              <Spec icon={Gauge}     label="Mileage"      value={`${vehicle.mileage} km/l`} />
              <Spec icon={Settings2} label="Transmission" value={vehicle.transmission.toUpperCase()} />
              {vehicle.engineCC > 0 && <Spec icon={Zap} label="Engine" value={`${vehicle.engineCC} cc`} />}
              {vehicle.bootSpace   && <Spec icon={Navigation2} label="Boot"  value={`${vehicle.bootSpace} L`} />}
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              {vehicle.hasAC        && <FeaturePill icon={Wind}       label="AC" />}
              {vehicle.hasBluetooth && <FeaturePill icon={Bluetooth}  label="Bluetooth" />}
              {vehicle.hasGPS       && <FeaturePill icon={Navigation2} label="GPS" />}
              {vehicle.hasChildSeat && <FeaturePill icon={Baby}       label="Child Seat" />}
            </div>
          </div>

          {/* Owner */}
          <div className="card p-5 flex items-center gap-4">
            <Avatar src={vehicle.owner?.avatar} name={vehicle.owner?.fullName} size={52} />
            <div className="flex-1">
              <p className="font-semibold">{vehicle.owner?.fullName}</p>
              <p className="text-sm" style={{ color: 'var(--text-mid)' }}>Vehicle Owner</p>
              {vehicle.owner?.isVerified && <span className="badge badge-green mt-1">KYC Verified</span>}
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Total trips</p>
              <p className="font-display font-bold text-xl" style={{ color: 'var(--accent)' }}>{vehicle.totalTrips}</p>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-lg mb-4">Reviews</h3>
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r._id} className="card p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar src={r.reviewer?.avatar} name={r.reviewer?.fullName} size={34} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{r.reviewer?.fullName}</p>
                        <StarRating value={r.overallRating} size={12} />
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                        {format(new Date(r.createdAt), 'dd MMM yyyy')}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm" style={{ color: 'var(--text-mid)' }}>{r.comment}</p>}
                    {r.ownerReply && (
                      <div className="mt-2 pl-3 text-sm" style={{ borderLeft: '2px solid var(--accent)', color: 'var(--text-mid)' }}>
                        <span className="font-semibold" style={{ color: 'var(--accent)' }}>Owner: </span>{r.ownerReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Booking panel ──────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-display font-bold text-3xl" style={{ color: 'var(--accent)' }}>₹{vehicle.ratePerHour}</span>
                <span className="text-sm ml-1" style={{ color: 'var(--text-dim)' }}>/hr</span>
              </div>
              <StatusBadge status={vehicle.status} />
            </div>
            <hr className="divider" />

            {vehicle.status === 'available' ? <>
              <div className="space-y-3">
                <div>
                  <label className="label">Pickup Date & Time</label>
                  <input type="datetime-local" className="input"
                    min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    value={pickupAt}
                    onChange={e => { setPickupAt(e.target.value); if (!returnAt) setReturnAt(format(addHours(new Date(e.target.value), 2), "yyyy-MM-dd'T'HH:mm")) }} />
                </div>
                <div>
                  <label className="label">Return Date & Time</label>
                  <input type="datetime-local" className="input"
                    min={pickupAt || format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    value={returnAt} onChange={e => setReturnAt(e.target.value)} />
                </div>
                <div>
                  <label className="label">Pickup City</label>
                  <input className="input" placeholder="e.g. Ranchi" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                {vehicle.insuranceAvailable && (
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={insurance} onChange={e => setInsurance(e.target.checked)}
                      className="accent-[var(--accent)] w-4 h-4" />
                    <Shield size={14} style={{ color: 'var(--accent)' }} />
                    Add insurance <span style={{ color: 'var(--text-dim)' }}>(₹{vehicle.insuranceFeePerHour}/hr)</span>
                  </label>
                )}
              </div>

              {hours > 0 && (
                <div className="rounded-xl p-4 space-y-2 text-sm" style={{ background: 'var(--surface2)' }}>
                  <div className="flex justify-between" style={{ color: 'var(--text-mid)' }}>
                    <span>₹{vehicle.ratePerHour} × {hours} hrs</span><span>₹{baseFare.toFixed(0)}</span>
                  </div>
                  {insFee > 0 && <div className="flex justify-between" style={{ color: 'var(--text-mid)' }}>
                    <span>Insurance</span><span>₹{insFee.toFixed(0)}</span>
                  </div>}
                  <div className="flex justify-between font-bold pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <span>Estimated total</span><span style={{ color: 'var(--accent)' }}>₹{totalFare.toFixed(0)}</span>
                  </div>
                </div>
              )}

              <button onClick={handleBook} disabled={booking} className="btn btn-primary w-full btn-lg">
                {booking ? <><Spinner size="sm" />Requesting…</> : <><Calendar size={16} />Request Booking</>}
              </button>
              <p className="text-xs text-center" style={{ color: 'var(--text-dim)' }}>
                You won't be charged until the owner confirms.
              </p>
            </> : (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-mid)' }}>
                This vehicle is currently not available for booking.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-dim)' }}>
        <Icon size={12} />{label}
      </div>
      <p className="text-sm font-semibold capitalize">{value}</p>
    </div>
  )
}

function FeaturePill({ icon: Icon, label }) {
  return (
    <span className="badge badge-orange gap-1.5">
      <Icon size={11} />{label}
    </span>
  )
}
