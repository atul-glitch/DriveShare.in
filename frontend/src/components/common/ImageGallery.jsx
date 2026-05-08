import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

export default function ImageGallery({ images = [], alt = 'image' }) {
  const [active,   setActive]   = useState(0)
  const [lightbox, setLightbox] = useState(false)

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightbox) return
    const handler = (e) => {
      if (e.key === 'ArrowRight') setActive(p => (p + 1) % images.length)
      if (e.key === 'ArrowLeft')  setActive(p => (p - 1 + images.length) % images.length)
      if (e.key === 'Escape')     setLightbox(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, images.length])

  if (!images?.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl text-6xl"
        style={{ height: 380, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
        🚗
      </div>
    )
  }

  const prev = () => setActive(p => (p - 1 + images.length) % images.length)
  const next = () => setActive(p => (p + 1) % images.length)

  return (
    <>
      {/* Main viewer */}
      <div className="space-y-2">
        <div className="relative rounded-2xl overflow-hidden group cursor-zoom-in"
          style={{ height: 380, background: 'var(--surface2)' }}
          onClick={() => setLightbox(true)}>
          <img src={images[active]} alt={alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />

          {/* Zoom icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.2)' }}>
            <ZoomIn size={32} color="white" />
          </div>

          {/* Arrows */}
          {images.length > 1 && <>
            <button onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <ChevronLeft size={20} color="white" />
            </button>
            <button onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <ChevronRight size={20} color="white" />
            </button>
          </>}

          {/* Counter */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-mono"
            style={{ background: 'rgba(0,0,0,0.7)' }}>
            {active + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button key={i} onClick={() => setActive(i)}
                className="flex-shrink-0 rounded-xl overflow-hidden transition-all"
                style={{
                  width: 64, height: 48,
                  border: `2px solid ${i === active ? 'var(--accent)' : 'transparent'}`,
                  opacity: i === active ? 1 : 0.55,
                }}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 p-2 rounded-full transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <X size={22} color="white" />
          </button>

          <img src={images[active]} alt={alt}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()} />

          {images.length > 1 && <>
            <button onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <ChevronLeft size={24} color="white" />
            </button>
            <button onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <ChevronRight size={24} color="white" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActive(i) }}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i === active ? 'var(--accent)' : 'rgba(255,255,255,0.35)',
                    transform: i === active ? 'scale(1.4)' : 'scale(1)' }} />
              ))}
            </div>
          </>}
        </div>
      )}
    </>
  )
}
