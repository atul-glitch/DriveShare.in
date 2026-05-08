import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Car } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { FormField, Spinner } from '../components/common'
import toast from 'react-hot-toast'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      await login(values)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    
    <div className="w-full max-w-md mx-auto px-4 pt-20 md:pt-24">
    <Navbar />
      {/* Card */}
      <div className="card p-8 animate-fade-up">
        {/* Header */}
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Car size={20} color="#fff" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl">Welcome back</h1>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Sign in to DriveShare</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email or Phone" error={errors.email?.message}>
            <input
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              <button type="button" onClick={() => setShow(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-dim)' }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg mt-2">
            {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign in'}
          </button>
        </form>

        <div className="divider" />

        <p className="text-sm text-center" style={{ color: 'var(--text-mid)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)' }} className="font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
      <Footer />
    </div>
   
      
  )
}
