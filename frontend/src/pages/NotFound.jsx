import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-8xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>404</p>
        <h1 className="font-display text-3xl font-bold mb-3">Page not found</h1>
        <p className="mb-8" style={{ color: 'var(--text-mid)' }}>
          The page you're looking for doesn't exist or was moved.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          <ArrowLeft size={18} /> Back to Home
        </Link>
      </div>
    </div>
  )
}
