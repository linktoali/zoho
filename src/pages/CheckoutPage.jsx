import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk'
import './CheckoutPage.css'

function CheckoutPage({ cart, cartTotal, clearCart }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    phoneNumber: '',
    paymentMethod: 'cash'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const SQUARE_APP_ID = import.meta.env.VITE_SQUARE_APP_ID || ''
  const SQUARE_LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID || ''

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (cart.length === 0) {
      setError('Your cart is empty!')
      setLoading(false)
      return
    }

    if (formData.paymentMethod === 'online') {
      setError('Please use the payment form below to pay online')
      setLoading(false)
      return
    }

    try {
      const orderData = {
        ...formData,
        pizzas: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: cartTotal
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (data.success) {
        clearCart()
        navigate(`/order-success/${data.orderId}`)
      } else {
        setError(data.message || 'Failed to place order')
      }
    } catch (err) {
      setError('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validateFormForPayment = () => {
    if (!formData.fullName.trim()) {
      setError('Please enter your full name')
      return false
    }
    if (!formData.email.trim()) {
      setError('Please enter your email')
      return false
    }
    if (!formData.phoneNumber.trim()) {
      setError('Please enter your phone number')
      return false
    }
    if (formData.paymentMethod !== 'pickup' && !formData.address.trim()) {
      setError('Please enter your address')
      return false
    }
    return true
  }

  const handleSquarePayment = async (token) => {
    if (!validateFormForPayment()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      if (!token) {
        throw new Error('Failed to process card information. Please check your card details and try again.')
      }

      const orderData = {
        ...formData,
        paymentMethod: 'online',
        pizzas: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: cartTotal,
        paymentToken: token
      }

      const response = await fetch('/api/orders/square-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (data.success) {
        clearCart()
        navigate(`/order-success/${data.orderId}`)
      } else {
        setError(data.message || 'Payment failed. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout">
          <h2>Your cart is empty</h2>
          <p>Add some pizzas before checking out!</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Menu
          </button>
        </div>
      </div>
    )
  }

  const isOnlinePayment = formData.paymentMethod === 'online'

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-container">
        <div className="checkout-form-section">
          <h2>Customer Information</h2>
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">
                {formData.paymentMethod === 'pickup' ? 'Address' : 'Delivery Address *'}
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                required={formData.paymentMethod !== 'pickup'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="cash">Cash on Delivery</option>
                <option value="pickup">Pay on Pickup</option>
                <option value="online">Online Payment (Square)</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            {!isOnlinePayment && (
              <button type="submit" className="submit-order-btn" disabled={loading}>
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            )}
          </form>

          {isOnlinePayment && SQUARE_APP_ID && SQUARE_LOCATION_ID && (
            <div className="square-payment-section">
              <h3>Complete Payment</h3>
              {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
              <div className="test-card-info">
                <p><strong>For testing, use these Square test card numbers:</strong></p>
                <p>Card: 4111 1111 1111 1111 | CVV: 111 | Exp: Any future date | Zip: Any 5 digits</p>
              </div>
              <PaymentForm
                applicationId={SQUARE_APP_ID}
                locationId={SQUARE_LOCATION_ID}
                cardTokenizeResponseReceived={async (token, buyer) => {
                  console.log('Token received:', token)
                  
                  try {
                    if (token.errors && token.errors.length > 0) {
                      console.error('Token errors:', token.errors)
                      const errorMessages = token.errors.map(error => error.message || error.type || 'Unknown error').join(', ')
                      setError(`Payment Error: ${errorMessages}`)
                      setLoading(false)
                      return
                    }
                    
                    if (!token || !token.token) {
                      setError('Failed to process card. Please check your card details.')
                      setLoading(false)
                      return
                    }
                    
                    await handleSquarePayment(token.token)
                  } catch (e) {
                    console.error('Tokenization error:', e)
                    setError('Payment failed: ' + (e.message || 'Please try again'))
                    setLoading(false)
                  }
                }}
              >
                <CreditCard 
                  includeInputLabels
                  buttonProps={{
                    isLoading: loading
                  }}
                />
              </PaymentForm>
            </div>
          )}

          {isOnlinePayment && (!SQUARE_APP_ID || !SQUARE_LOCATION_ID) && (
            <div className="error-message">
              Square payment is not configured. Please contact the administrator.
            </div>
          )}
        </div>

        <div className="order-summary-section">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cart.map(item => (
              <div key={item.id} className="summary-item">
                <div className="summary-item-info">
                  <span className="summary-item-name">{item.name}</span>
                  <span className="summary-item-quantity">x{item.quantity}</span>
                </div>
                <span className="summary-item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span className="total-amount">${cartTotal.toFixed(2)}</span>
          </div>
          {formData.paymentMethod && (
            <div className="payment-info">
              <strong>Payment:</strong>{' '}
              {formData.paymentMethod === 'cash' && 'Cash on Delivery'}
              {formData.paymentMethod === 'pickup' && 'Pay on Pickup'}
              {formData.paymentMethod === 'online' && 'Online Payment'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
