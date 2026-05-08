import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { Avatar, FormField, Spinner, StatusBadge } from '../components/common'
import { useForm } from 'react-hook-form'
import { Shield, Phone, Mail, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { register, handleSubmit } = useForm({
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' }
  })
  const [pwLoading, setPwLoading] = useState(false)

  const changePassword = async (values) => {
    setPwLoading(true)
    try {
      await authAPI.changePassword(values)
      toast.success('Password changed!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed')
    } finally { setPwLoading(false) }
  }

  if (!user) return null

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold">Profile</h1>

      {/* User card */}
      <div className="card p-6 flex items-center gap-5">
        <Avatar src={user.avatar} name={user.fullName} size={64} />
        <div className="flex-1">
          <h2 className="font-display font-bold text-xl">{user.fullName}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {user.role?.map(r => <span key={r} className="badge badge-orange capitalize">{r}</span>)}
            <StatusBadge status={user.isVerified ? 'verified' : 'pending'} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card p-5 space-y-3">
        <h3 className="font-display font-semibold mb-2">Account Info</h3>
        <InfoRow icon={User}   label="Full Name" value={user.fullName} />
        <InfoRow icon={Mail}   label="Email"     value={user.email} />
        <InfoRow icon={Phone}  label="Phone"     value={user.phone} />
        <InfoRow icon={Shield} label="KYC Status" value={user.isVerified ? 'Verified' : 'Pending verification'} />
      </div>

      {/* Change password */}
      <div className="card p-5">
        <h3 className="font-display font-semibold mb-4">Change Password</h3>
        <form onSubmit={handleSubmit(changePassword)} className="space-y-3">
          <FormField label="Current Password">
            <input type="password" className="input" placeholder="••••••••" {...register('oldPassword', { required: true })} />
          </FormField>
          <FormField label="New Password">
            <input type="password" className="input" placeholder="Min 8 characters" {...register('newPassword', { required: true, minLength: 8 })} />
          </FormField>
          <FormField label="Confirm New Password">
            <input type="password" className="input" placeholder="••••••••" {...register('confirmPassword', { required: true })} />
          </FormField>
          <button type="submit" disabled={pwLoading} className="btn btn-primary">
            {pwLoading ? <Spinner size="sm" /> : 'Update Password'}
          </button>
        </form>
      </div>

      {/* KYC docs status */}
      <div className="card p-5">
        <h3 className="font-display font-semibold mb-4">KYC Documents</h3>
        <div className="space-y-3">
          {[
            { label: 'Driving Licence', doc: user.drivingLicence },
            { label: 'Aadhar Card',     doc: user.aadhar },
          ].map(({ label, doc }) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--surface2)' }}>
              <span className="text-sm font-medium">{label}</span>
              {doc
                ? <StatusBadge status={doc.verificationStatus || 'pending'} />
                : <span className="badge badge-red">Not uploaded</span>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-sm py-2" style={{ borderBottom: '1px solid var(--border)' }}>
      <Icon size={14} style={{ color: 'var(--accent)' }} className="flex-shrink-0" />
      <span style={{ color: 'var(--text-mid)', minWidth: 100 }}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
