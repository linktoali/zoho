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

  const handleSquarePayment = async (token) => {
    setLoading(true)
    setError('')

    try {
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
      setError('Payment failed. Please try again.')
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
              <PaymentForm
                applicationId={SQUARE_APP_ID}
                locationId={SQUARE_LOCATION_ID}
                cardTokenizeResponseReceived={async (token) => {
                  await handleSquarePayment(token.token)
                }}
                createVerificationDetails={() => ({
                  amount: cartTotal.toFixed(2),
                  billingContact: {
                    givenName: formData.fullName.split(' ')[0] || '',
                    familyName: formData.fullName.split(' ').slice(1).join(' ') || '',
                    email: formData.email,
                    phone: formData.phoneNumber,
                    addressLines: [formData.address],
                    countryCode: 'US'
                  },
                  currencyCode: 'USD',
                  intent: 'CHARGE'
                })}
              >
                <CreditCard />
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
