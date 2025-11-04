import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './OrderSuccessPage.css'

function OrderSuccessPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          setOrder(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [orderId])

  if (loading) {
    return <div className="loading-page">Loading order details...</div>
  }

  return (
    <div className="order-success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p className="success-message">
          Thank you for your order! Your delicious pizza is being prepared.
        </p>

        {order && (
          <div className="order-details">
            <h2>Order Details</h2>
            <div className="detail-row">
              <span className="detail-label">Order ID:</span>
              <span className="detail-value">{order._id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{order.fullName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{order.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Delivery Address:</span>
              <span className="detail-value">{order.address}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{order.phoneNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">
                {order.paymentMethod === 'cash' && 'Cash on Delivery'}
                {order.paymentMethod === 'pickup' && 'Pay on Pickup'}
                {order.paymentMethod === 'online' && 'Online Payment (Square)'}
              </span>
            </div>
            {order.status && (
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">{order.status === 'paid' ? 'Paid' : 'Pending'}</span>
              </div>
            )}

            <div className="ordered-items">
              <h3>Ordered Items:</h3>
              {order.pizzas.map((pizza, index) => (
                <div key={index} className="ordered-item">
                  <span>{pizza.name} x{pizza.quantity}</span>
                  <span>${(pizza.price * pizza.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="order-total">
              <span>Total Amount:</span>
              <span className="total-value">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Link to="/" className="home-btn">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default OrderSuccessPage
