import { Link } from 'react-router-dom'
import './CartPage.css'

function CartPage({ cart, updateQuantity, removeFromCart, cartTotal }) {
  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some delicious pizzas to get started!</p>
          <Link to="/" className="continue-shopping-btn">
            Browse Pizzas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-image" />
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              <p className="cart-item-price">${item.price.toFixed(2)} each</p>
            </div>
            <div className="cart-item-quantity">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="quantity-btn"
              >
                -
              </button>
              <span className="quantity">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="quantity-btn"
              >
                +
              </button>
            </div>
            <div className="cart-item-subtotal">
              <p>${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button
              onClick={() => removeFromCart(item.id)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <Link to="/checkout" className="checkout-btn">
          Proceed to Checkout
        </Link>
        <Link to="/" className="continue-shopping-link">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default CartPage
