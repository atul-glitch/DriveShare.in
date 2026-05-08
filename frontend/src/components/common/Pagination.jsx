import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  // Build page number array with ellipsis
  const getPages = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="btn btn-outline btn-sm p-2">
        <ChevronLeft size={15} />
      </button>

      {getPages().map((p, i) =>
        p === '...'
          ? <span key={`e${i}`} className="px-2 text-sm" style={{ color: 'var(--text-dim)' }}>…</span>
          : (
            <button key={p}
              onClick={() => onPageChange(p)}
              className={`btn btn-sm min-w-[36px] ${p === page ? 'btn-primary' : 'btn-outline'}`}>
              {p}
            </button>
          )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="btn btn-outline btn-sm p-2">
        <ChevronRight size={15} />
      </button>
    </div>
  )
}
