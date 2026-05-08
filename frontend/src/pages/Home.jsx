import { Link } from 'react-router-dom'
import { ArrowRight, Shield, MapPin, CreditCard, Star, Car, Zap, Clock } from 'lucide-react'

const STATS   = [{ v:'2,400+', l:'Vehicles listed' }, { v:'12K+', l:'Happy renters' }, { v:'4.9★', l:'Average rating' }, { v:'₹120', l:'Starting per hour' }]
const HOW     = [
  { n:'01', icon: MapPin,    t:'Find nearby',   d:'Browse verified vehicles near you with real-time availability and map view.' },
  { n:'02', icon: Shield,    t:'Book securely', d:'Confirm in seconds. Your booking is protected and insurance optional.' },
  { n:'03', icon: Car,       t:'Pick up & go',  d:'Meet the owner, verify docs, get the keys — drive wherever you want.' },
  { n:'04', icon: CreditCard,t:'Pay after use', d:'Fare calculated at ₹120/hr. Pay via Razorpay after returning the vehicle.' },
]
const FEATURES = [
  { icon: Shield, t:'KYC Verified', d:'Every owner and renter is verified with Aadhar and Driving Licence.' },
  { icon: Zap,    t:'Instant Book', d:'No waiting. Confirm a booking in under 60 seconds.' },
  { icon: Clock,  t:'Flexible Hours', d:'Rent for 1 hour or 7 days. You decide.' },
  { icon: Star,   t:'Trusted Reviews', d:'Genuine ratings from real trips build community trust.' },
]

export default function Home() {
  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[120px] opacity-20"
            style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[100px] opacity-10"
            style={{ background: '#7c3aed' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-24">
          <div className="max-w-3xl">
            <div className="section-tag animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              Peer-to-peer vehicle rental
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up"
              style={{ animationDelay: '0.2s', opacity: 0, lineHeight: 1.05 }}>
              Drive anything.<br />
              <span style={{ color: 'var(--accent)' }}>Own nothing.</span>
            </h1>
            <p className="text-lg mb-10 max-w-xl animate-fade-up"
              style={{ color: 'var(--text-mid)', animationDelay: '0.3s', opacity: 0 }}>
              Rent verified vehicles from local owners. From hatchbacks to SUVs — available by the hour, with insurance, delivered to your door.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
              <Link to="/vehicles" className="btn btn-primary btn-lg">
                Browse Vehicles <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                List your car
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 animate-fade-up"
            style={{ animationDelay: '0.5s', opacity: 0 }}>
            {STATS.map(s => (
              <div key={s.v} className="stat-card text-center">
                <p className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--accent)' }}>{s.v}</p>
                <p className="text-sm" style={{ color: 'var(--text-mid)' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="section-tag justify-center">Process</div>
            <h2 className="font-display text-4xl font-bold">How DriveShare works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW.map((s, i) => (
              <div key={s.n} className="card p-6 relative group">
                <div className="absolute -top-3 -right-3 font-mono text-5xl font-black select-none pointer-events-none"
                  style={{ color: 'var(--border)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(249,115,22,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--border)'}
                >{s.n}</div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'var(--accent-dim)' }}>
                  <s.icon size={22} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{s.t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{s.d}</p>
                {i < HOW.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 text-lg" style={{ color: 'var(--border)' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-tag">Why us</div>
              <h2 className="font-display text-4xl font-bold mb-6">
                Built for trust,<br />designed for speed
              </h2>
              <p className="mb-10" style={{ color: 'var(--text-mid)' }}>
                Every feature is designed to make renting a vehicle as safe and frictionless as getting into a cab.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {FEATURES.map(f => (
                  <div key={f.t} className="flex gap-4 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--accent-dim)' }}>
                      <f.icon size={17} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-0.5">{f.t}</p>
                      <p className="text-xs" style={{ color: 'var(--text-mid)' }}>{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: decorative card stack */}
            <div className="relative h-80 hidden lg:block">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="card p-6 w-72 rotate-[-4deg] absolute" style={{ top: 30, left: 40 }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full" style={{ background: 'var(--accent-dim)' }} />
                    <div>
                      <div className="h-3 w-24 skeleton" />
                      <div className="h-2 w-16 skeleton mt-1" />
                    </div>
                  </div>
                  <div className="h-2 skeleton mb-2" /><div className="h-2 skeleton w-2/3" />
                </div>
                <div className="card p-5 w-64 rotate-[3deg] absolute" style={{ bottom: 20, right: 30 }}>
                  <div className="flex gap-1 mb-2">{[...Array(5)].map((_,i)=> <Star key={i} size={14} fill="#f97316" stroke="#f97316" />)}</div>
                  <div className="h-2 skeleton mb-1.5 w-full" />
                  <div className="h-2 skeleton w-4/5" />
                </div>
                <div className="card p-5 w-60 relative z-10">
                  <p className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>Total fare</p>
                  <p className="font-display font-bold text-3xl" style={{ color: 'var(--accent)' }}>₹840</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-mid)' }}>7 hrs × ₹120/hr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--surface)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-4xl font-bold mb-4">Ready to hit the road?</h2>
          <p className="mb-8" style={{ color: 'var(--text-mid)' }}>
            Join thousands of renters and owners building the future of shared mobility in India.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="btn btn-primary btn-lg">Create free account</Link>
            <Link to="/vehicles" className="btn btn-outline btn-lg">Explore vehicles</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm" style={{ color: 'var(--text-dim)', borderTop: '1px solid var(--border)' }}>
        © {new Date().getFullYear()} DriveShare. Built with ❤️ in India.
      </footer>
    </div>
  )
}
