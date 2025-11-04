import './PizzaCard.css'

function PizzaCard({ pizza, addToCart }) {
  return (
    <div className="pizza-card">
      <img src={pizza.image} alt={pizza.name} className="pizza-image" />
      <div className="pizza-info">
        <h3 className="pizza-name">{pizza.name}</h3>
        <p className="pizza-description">{pizza.description}</p>
        <div className="pizza-footer">
          <span className="pizza-price">${pizza.price.toFixed(2)}</span>
          <button className="add-to-cart-btn" onClick={() => addToCart(pizza)}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default PizzaCard
