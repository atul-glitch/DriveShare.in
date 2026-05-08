import { paymentAPI } from '../services/api'
import toast from 'react-hot-toast'

const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
let razorpayLoader = null

const loadRazorpay = async () => {
  if (window.Razorpay) return true
  if (razorpayLoader) return razorpayLoader

  razorpayLoader = new Promise(resolve => {
    const existing = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = RAZORPAY_CHECKOUT_URL
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  return razorpayLoader
}

export function useRazorpay() {
  const pay = async (bookingId, onSuccess) => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
    if (!razorpayKey) {
      toast.error('Razorpay key is missing from frontend environment')
      return
    }

    const loaded = await loadRazorpay()
    if (!loaded || !window.Razorpay) {
      toast.error('Unable to load Razorpay checkout')
      return
    }

    let orderData
    try {
      const { data } = await paymentAPI.initiate(bookingId)
      orderData = data.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment')
      return
    }

    const options = {
      key: razorpayKey,
      amount: orderData.totalAmount * 100,
      currency: orderData.currency || 'INR',
      name: 'DriveShare',
      description: `Booking Payment - Rs.${orderData.totalAmount}`,
      order_id: orderData.gatewayOrderId,
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: { color: '#f97316' },
      handler: async (response) => {
        try {
          await paymentAPI.verify(bookingId, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          toast.success('Payment successful!')
          onSuccess?.()
        } catch (err) {
          toast.error(err.response?.data?.message || 'Payment verification failed')
        }
      },
      modal: {
        ondismiss: () => toast('Payment cancelled', { icon: '!' }),
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response) => {
      toast.error(`Payment failed: ${response.error.description}`)
    })
    rzp.open()
  }

  return { pay }
}
