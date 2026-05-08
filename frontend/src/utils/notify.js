import toast from 'react-hot-toast'
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'

const iconStyle = (color) => ({ color, flexShrink: 0 })

const base = {
  style: {
    background: '#1a1714',
    color: '#f5f0ea',
    border: '1px solid #2e2924',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'Satoshi, sans-serif',
    padding: '12px 16px',
  },
}

export const notify = {
  success: (msg) => toast.success(msg, {
    ...base,
    icon: <CheckCircle2 size={18} style={iconStyle('#22c55e')} />,
  }),

  error: (msg) => toast.error(msg, {
    ...base,
    icon: <XCircle size={18} style={iconStyle('#ef4444')} />,
  }),

  warning: (msg) => toast(msg, {
    ...base,
    icon: <AlertTriangle size={18} style={iconStyle('#eab308')} />,
  }),

  info: (msg) => toast(msg, {
    ...base,
    icon: <Info size={18} style={iconStyle('#38bdf8')} />,
  }),

  promise: (promise, { loading, success, error }) =>
    toast.promise(promise, { loading, success, error }, base),

  dismiss: (id) => toast.dismiss(id),
}

export default notify
