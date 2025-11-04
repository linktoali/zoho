import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import './App.css'

function App() {
  const [cart, setCart] = useState([])

  const addToCart = (pizza) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === pizza.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === pizza.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...pizza, quantity: 1 }]
    })
  }

  const removeFromCart = (pizzaId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== pizzaId))
  }

  const updateQuantity = (pizzaId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(pizzaId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === pizzaId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <Router>
      <div className="App">
        <Navbar cartCount={cartCount} />
        <Routes>
          <Route path="/" element={<HomePage addToCart={addToCart} />} />
          <Route
            path="/cart"
            element={
              <CartPage
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                cartTotal={cartTotal}
              />
            }
          />
          <Route
            path="/checkout"
            element={<CheckoutPage cart={cart} cartTotal={cartTotal} clearCart={clearCart} />}
          />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
