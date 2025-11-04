import { useState, useEffect } from 'react'
import PizzaCard from '../components/PizzaCard'
import './HomePage.css'

function HomePage({ addToCart }) {
  const [pizzas, setPizzas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/pizzas')
      .then(res => res.json())
      .then(data => {
        setPizzas(data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load pizzas')
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="loading">Loading delicious pizzas...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="home-page">
      <div className="hero">
        <h1>Welcome to Pizza Paradise!</h1>
        <p>Choose from our delicious selection of freshly made pizzas</p>
      </div>
      <div className="pizza-grid">
        {pizzas.map(pizza => (
          <PizzaCard key={pizza.id} pizza={pizza} addToCart={addToCart} />
        ))}
      </div>
    </div>
  )
}

export default HomePage
