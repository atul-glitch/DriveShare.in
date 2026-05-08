import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Car, Upload, Check, ChevronRight } from 'lucide-react'
import { authAPI } from '../services/api'
import { FormField, Spinner } from '../components/common'
import toast from 'react-hot-toast'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

const STEPS = ['Account', 'Driving Licence', 'Aadhar', 'Review']

const getApiErrorMessage = (err) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Registration failed'
  )
}

export default function Register() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors }, getValues } = useForm()
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [show,    setShow]    = useState(false)

  // File previews
  const [files, setFiles]   = useState({})
  const [previews, setPreviews] = useState({})

  const handleFile = (name, file) => {
    if (!file) return
    setFiles(p => ({ ...p, [name]: file }))
    setPreviews(p => ({ ...p, [name]: URL.createObjectURL(file) }))
  }

  const onSubmit = async (values) => {
    if (step < STEPS.length - 1) { setStep(p => p + 1); return }
    // Final submit
    setLoading(true)
    try {
      const requiredFiles = ['dl_front', 'dl_back', 'aadhar_front', 'aadhar_back']
      const missingFile = requiredFiles.find(key => !files[key])
      if (missingFile) {
        throw new Error('Please upload all required Driving Licence and Aadhar images')
      }

      const fd = new FormData()
      // Account
      fd.append('fullName', values.fullName)
      fd.append('email',    values.email)
      fd.append('phone',    values.phone)
      fd.append('password', values.password)
      const selectedRoles = Array.isArray(values.role)
        ? values.role
        : values.role
          ? [values.role]
          : ['renter']
      selectedRoles.forEach(r => fd.append('role', r))
      // DL
      fd.append('dl_number',  values.dl_number)
      fd.append('dl_dob',     values.dl_dob)
      fd.append('dl_expiry',  values.dl_expiry)
      fd.append('dl_classes', values.dl_classes || 'LMV')
      if (files.dl_front) fd.append('dl_front', files.dl_front)
      if (files.dl_back)  fd.append('dl_back',  files.dl_back)
      // Aadhar
      fd.append('aadhar_number', values.aadhar_number)
      fd.append('aadhar_name',   values.aadhar_name)
      fd.append('aadhar_dob',    values.aadhar_dob)
      if (values.aadhar_street?.trim())  fd.append('aadhar_street', values.aadhar_street.trim())
      if (values.aadhar_city?.trim())    fd.append('aadhar_city', values.aadhar_city.trim())
      if (values.aadhar_state?.trim())   fd.append('aadhar_state', values.aadhar_state.trim())
      if (values.aadhar_pincode?.trim()) fd.append('aadhar_pincode', values.aadhar_pincode.trim())
      if (files.aadhar_front) fd.append('aadhar_front', files.aadhar_front)
      if (files.aadhar_back)  fd.append('aadhar_back',  files.aadhar_back)

      await authAPI.register(fd)
      toast.success('Registered! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(getApiErrorMessage(err))
      setStep(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-20 md:pt-24 pb-8">
    <Navbar />
      <div className="card p-8 animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Car size={18} color="#fff" />
          </div>
          <h1 className="font-display font-bold text-xl">Create account</h1>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[var(--accent)] text-white' : ''
              }`}
                style={i > step ? { background: 'var(--surface2)', color: 'var(--text-dim)', border: '1px solid var(--border)' } : {}}>
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-[var(--accent)] font-semibold' : ''}`}
                style={i !== step ? { color: 'var(--text-dim)' } : {}}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px mx-1" style={{ background: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Step 0 — Account */}
          {step === 0 && <>
            <FormField label="Full Name" error={errors.fullName?.message} required>
              <input className="input" placeholder="Ravi Kumar"
                {...register('fullName', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Email" error={errors.email?.message} required>
                <input className="input" type="email" placeholder="you@email.com"
                  {...register('email', { required: 'Required' })} />
              </FormField>
              <FormField label="Phone" error={errors.phone?.message} required>
                <input className="input" placeholder="9876543210"
                  {...register('phone', { required: 'Required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid number' } })} />
              </FormField>
            </div>
            <FormField label="Password" error={errors.password?.message} required>
              <div className="relative">
                <input type={show ? 'text' : 'password'} className="input pr-10" placeholder="Min 8 characters"
                  {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
                <button type="button" onClick={() => setShow(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>
            <FormField label="I want to…">
              <div className="flex gap-3">
                {['renter','owner'].map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" value={r} {...register('role')}
                      defaultChecked={r === 'renter'}
                      className="accent-[var(--accent)] w-4 h-4" />
                    <span className="text-sm capitalize">{r === 'renter' ? '🚗 Rent vehicles' : '🔑 List vehicles'}</span>
                  </label>
                ))}
              </div>
            </FormField>
          </>}

          {/* Step 1 — Driving Licence */}
          {step === 1 && <>
            <div className="section-tag">Driving Licence</div>
            <FormField label="Licence Number" error={errors.dl_number?.message} required>
              <input className="input uppercase" placeholder="MH0120210012345"
                {...register('dl_number', { required: 'Required' })} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date of Birth" error={errors.dl_dob?.message} required>
                <input type="date" className="input" {...register('dl_dob', { required: 'Required' })} />
              </FormField>
              <FormField label="Expiry Date" error={errors.dl_expiry?.message} required>
                <input type="date" className="input" {...register('dl_expiry', { required: 'Required' })} />
              </FormField>
            </div>
            <FormField label="Vehicle Classes">
              <input className="input" placeholder="LMV, MCWG (comma separated)" {...register('dl_classes')} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FileUpload label="Front Image" name="dl_front" preview={previews.dl_front} onFile={handleFile} required />
              <FileUpload label="Back Image"  name="dl_back"  preview={previews.dl_back}  onFile={handleFile} required />
            </div>
          </>}

          {/* Step 2 — Aadhar */}
          {step === 2 && <>
            <div className="section-tag">Aadhar Card</div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Aadhar Number" error={errors.aadhar_number?.message} required>
                <input className="input" placeholder="123456789012"
                  {...register('aadhar_number', { required: 'Required', pattern: { value: /^\d{12}$/, message: '12 digits' } })} />
              </FormField>
              <FormField label="Name on Aadhar" error={errors.aadhar_name?.message} required>
                <input className="input" placeholder="As on Aadhar" {...register('aadhar_name', { required: 'Required' })} />
              </FormField>
            </div>
            <FormField label="Date of Birth" required>
              <input type="date" className="input" {...register('aadhar_dob', { required: 'Required' })} />
            </FormField>
            <div className="grid grid-cols-3 gap-2">
              <FormField label="City">
                <input className="input" placeholder="Ranchi" {...register('aadhar_city')} />
              </FormField>
              <FormField label="State">
                <input className="input" placeholder="Jharkhand" {...register('aadhar_state')} />
              </FormField>
              <FormField label="Pincode">
                <input className="input" placeholder="834001" {...register('aadhar_pincode')} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FileUpload label="Front Image" name="aadhar_front" preview={previews.aadhar_front} onFile={handleFile} required />
              <FileUpload label="Back Image"  name="aadhar_back"  preview={previews.aadhar_back}  onFile={handleFile} required />
            </div>
          </>}

          {/* Step 3 — Review */}
          {step === 3 && <>
            <div className="section-tag">Review & Submit</div>
            <div className="space-y-3 rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
              <ReviewRow label="Name"    value={getValues('fullName')} />
              <ReviewRow label="Email"   value={getValues('email')} />
              <ReviewRow label="Phone"   value={getValues('phone')} />
              <ReviewRow label="DL No."  value={getValues('dl_number')} />
              <ReviewRow label="Aadhar"  value={getValues('aadhar_number')?.replace(/\d(?=\d{4})/g, '•')} />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-mid)' }}>
              By registering you agree to our Terms of Service. KYC documents will be verified within 24 hours.
            </p>
          </>}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep(p => p - 1)} className="btn btn-outline flex-1">Back</button>
            )}
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? <><Spinner size="sm" /> Registering…</> :
               step < STEPS.length - 1 ? <><span>Next</span><ChevronRight size={16} /></> : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="text-sm text-center mt-4" style={{ color: 'var(--text-mid)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }} className="font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
      <Footer />
    </div>
  )
}

function FileUpload({ label, name, preview, onFile, required }) {
  return (
    <div className="space-y-1.5">
      <label className="label">{label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}</label>
      <label className="relative flex flex-col items-center justify-center rounded-xl cursor-pointer overflow-hidden transition-colors"
        style={{ height: 100, border: '1px dashed var(--border-light)', background: 'var(--surface2)' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}>
        {preview
          ? <img src={preview} alt="" className="w-full h-full object-cover" />
          : <><Upload size={18} style={{ color: 'var(--text-dim)' }} /><span className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>Upload</span></>
        }
        <input type="file" accept="image/*" className="hidden" onChange={e => onFile(name, e.target.files[0])} />
      </label>
    </div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: 'var(--text-mid)' }}>{label}</span>
      <span className="font-medium">{value || '—'}</span>
    </div>
  )
}
