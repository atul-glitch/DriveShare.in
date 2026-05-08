import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { vehicleAPI } from '../services/api'
import { EmptyState, Spinner, StatusBadge, FormField, ConfirmModal } from '../components/common'
import { Car, PlusCircle, Edit3, Trash2, MapPin, Fuel, Users, Gauge, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

// ── My Vehicles ───────────────────────────────────────────────────────────────
export function MyVehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [delId,    setDelId]    = useState(null)
  const [delBusy,  setDelBusy]  = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const { data } = await vehicleAPI.getMyListings()
      setVehicles(data.data)
    } catch (e) {
      setVehicles([])
      toast.error(e.response?.data?.message || 'Failed to load your listings')
    } finally { setLoading(false) }
  }
  useEffect(() => { fetch() }, [])

  const handleDelete = async () => {
    setDelBusy(true)
    try { await vehicleAPI.delete(delId); toast.success('Vehicle deleted'); await fetch() }
    catch (e) { toast.error(e.response?.data?.message || 'Delete failed') }
    finally { setDelBusy(false); setDelId(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">My Listings</h1>
        <Link to="/vehicles/new" className="btn btn-primary btn-sm"><PlusCircle size={15} /> Add Vehicle</Link>
      </div>

      {loading ? <div className="flex justify-center py-10"><Spinner /></div>
        : vehicles.length === 0
          ? <EmptyState icon={Car} title="No vehicles listed" description="List your first vehicle and start earning."
              action={<Link to="/vehicles/new" className="btn btn-primary">List a vehicle</Link>} />
          : (
            <div className="space-y-3">
              {vehicles.map(v => (
                <div key={v._id} className="card card-interactive p-4 flex gap-4">
                  {/* Thumb */}
                  <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--surface2)' }}>
                    {v.images?.[0] ? <img src={v.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🚗</div>}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold">{v.make} {v.model} <span className="text-sm font-normal" style={{ color: 'var(--text-dim)' }}>{v.year}</span></h3>
                      <StatusBadge status={v.status} />
                    </div>
                    <div className="flex gap-4 text-xs" style={{ color: 'var(--text-mid)' }}>
                      <span className="flex items-center gap-1"><Fuel size={10}/>{v.fuelType}</span>
                      <span className="flex items-center gap-1"><Users size={10}/>{v.seats}</span>
                      <span className="flex items-center gap-1"><Gauge size={10}/>{v.mileage} km/l</span>
                      {v.currentLocation?.address?.city && <span className="flex items-center gap-1"><MapPin size={10}/>{v.currentLocation.address.city}</span>}
                    </div>
                  </div>
                  {/* Price + actions */}
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                    <span className="font-display font-bold" style={{ color: 'var(--accent)' }}>₹{v.ratePerHour}/hr</span>
                    <div className="flex gap-2">
                      <Link to={`/vehicles/${v._id}`} className="btn btn-ghost btn-sm p-1.5"><Edit3 size={14}/></Link>
                      <button onClick={() => setDelId(v._id)} className="btn btn-ghost btn-sm p-1.5" style={{ color: '#ef4444' }}><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
      }
      <ConfirmModal open={!!delId} title="Delete Vehicle" message="This will permanently remove the vehicle and all its images." confirmLabel="Delete" danger
        onConfirm={handleDelete} onCancel={() => setDelId(null)} />
    </div>
  )
}

// ── List New Vehicle ──────────────────────────────────────────────────────────
const CATEGORIES    = ['hatchback','sedan','suv','muv','bike','scooter','truck','van']
const FUEL_TYPES    = ['petrol','diesel','electric','cng','hybrid']
const TRANSMISSIONS = ['manual','automatic','amt']

export function ListVehicle() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { ratePerHour: 120 } })
  const [images,   setImages]   = useState([])
  const [previews, setPreviews] = useState([])
  const [loading,  setLoading]  = useState(false)

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 8)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const onSubmit = async (values) => {
    if (images.length === 0) { toast.error('Please upload at least one image'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(values).forEach(([k, v]) => fd.append(k, v))
      images.forEach(img => fd.append('images', img))
      await vehicleAPI.create(fd)
      toast.success('Vehicle listed successfully!')
      navigate('/my-vehicles')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to list vehicle')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold">List Your Vehicle</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic info */}
        <div className="card p-5 space-y-4">
          <div className="section-tag">Vehicle Identity</div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Make" error={errors.make?.message} required>
              <input className="input" placeholder="Maruti" {...register('make', { required: 'Required' })} />
            </FormField>
            <FormField label="Model" error={errors.model?.message} required>
              <input className="input" placeholder="Swift" {...register('model', { required: 'Required' })} />
            </FormField>
            <FormField label="Year" error={errors.year?.message} required>
              <input type="number" className="input" placeholder="2022" {...register('year', { required: 'Required', min: 2000, max: new Date().getFullYear() })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Registration No." error={errors.registrationNumber?.message} required>
              <input className="input uppercase" placeholder="MH12AB1234" {...register('registrationNumber', { required: 'Required' })} />
            </FormField>
            <FormField label="Color">
              <input className="input" placeholder="White" {...register('color')} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category" required>
              <select className="input" {...register('category', { required: 'Required' })}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </FormField>
            <FormField label="Fuel Type" required>
              <select className="input" {...register('fuelType', { required: 'Required' })}>
                {FUEL_TYPES.map(f => <option key={f} value={f} className="capitalize">{f}</option>)}
              </select>
            </FormField>
          </div>
        </div>

        {/* Specs */}
        <div className="card p-5 space-y-4">
          <div className="section-tag">Specifications</div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Transmission">
              <select className="input" {...register('transmission')}>
                {TRANSMISSIONS.map(t => <option key={t} value={t} className="uppercase">{t}</option>)}
              </select>
            </FormField>
            <FormField label="Seats" required>
              <input type="number" className="input" min={1} max={50} {...register('seats', { required: 'Required' })} />
            </FormField>
            <FormField label="Mileage (km/l)" required>
              <input type="number" className="input" step="0.1" {...register('mileage', { required: 'Required' })} />
            </FormField>
            <FormField label="Engine (CC)">
              <input type="number" className="input" placeholder="1197" {...register('engineCC')} />
            </FormField>
            <FormField label="Boot Space (L)">
              <input type="number" className="input" placeholder="268" {...register('bootSpace')} />
            </FormField>
          </div>
          <div className="flex flex-wrap gap-4">
            {[['hasAC','AC'],['hasBluetooth','Bluetooth'],['hasGPS','GPS'],['hasChildSeat','Child Seat']].map(([n,l]) => (
              <label key={n} className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" {...register(n)} className="accent-[var(--accent)] w-4 h-4" /> {l}
              </label>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-5 space-y-4">
          <div className="section-tag">Pricing</div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Rate per Hour (₹)" required>
              <input type="number" className="input" min={0} {...register('ratePerHour', { required: 'Required' })} />
            </FormField>
            <FormField label="Insurance Fee /hr (₹)">
              <input type="number" className="input" min={0} placeholder="0" {...register('insuranceFeePerHour')} />
            </FormField>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" {...register('insuranceAvailable')} className="accent-[var(--accent)] w-4 h-4" />
            Offer insurance add-on
          </label>
        </div>

        {/* Location */}
        <div className="card p-5 space-y-4">
          <div className="section-tag">Current Location</div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Longitude" required>
              <input type="number" step="any" className="input" placeholder="85.3096" {...register('longitude', { required: 'Required' })} />
            </FormField>
            <FormField label="Latitude" required>
              <input type="number" step="any" className="input" placeholder="23.3441" {...register('latitude', { required: 'Required' })} />
            </FormField>
            <FormField label="City">
              <input className="input" placeholder="Ranchi" {...register('city')} />
            </FormField>
            <FormField label="State">
              <input className="input" placeholder="Jharkhand" {...register('state')} />
            </FormField>
          </div>
        </div>

        {/* Images */}
        <div className="card p-5 space-y-4">
          <div className="section-tag">Photos</div>
          <label className="flex flex-col items-center gap-3 py-10 rounded-xl cursor-pointer transition-colors"
            style={{ border: '2px dashed var(--border-light)', background: 'var(--surface2)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}>
            <Upload size={24} style={{ color: 'var(--text-dim)' }} />
            <span className="text-sm" style={{ color: 'var(--text-mid)' }}>Click to upload up to 8 images</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
          </label>
          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {previews.map((p, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '4/3', background: 'var(--surface2)' }}>
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? <><Spinner size="sm" /> Listing…</> : <><Car size={18} /> List Vehicle</>}
        </button>
      </form>
    </div>
  )
}
